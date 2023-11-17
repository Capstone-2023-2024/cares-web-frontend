import {
  addDoc,
  and,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { useAuth } from "~/contexts/AuthContext";
import type { ConcernBaseProps, ConcernProps } from "~/types/complaints";
import { collectionRef } from "~/types/firebase";
import type { StudentWithClassSection } from "~/types/student";

interface ConcernPropsExtended extends ConcernProps {
  id: string;
}

interface ConcernBasePropsExtended extends ConcernBaseProps {
  id: string;
}

interface InitStateProps {
  role?: "student" | "mayor";
  mayor?: StudentWithClassSection;
  chatBox?: string;
  classMates?: StudentWithClassSection[];
  currentStudent?: StudentWithClassSection;
  complaintRecord?: ConcernPropsExtended[];
  groupComplaints?: ConcernBasePropsExtended[];
  targetDocument?: DocumentReference<DocumentData, DocumentData>;
  message: string;
  selectedChat: string | Omit<ConcernProps, "messages">;
  showMayorModal: boolean;
}

const Complaints = () => {
  const initState: InitStateProps = {
    message: "",
    selectedChat: "",
    showMayorModal: false,
  };
  const [state, setState] = useState(initState);
  const { currentUser } = useAuth();
  const complaintsCol = collectionRef("complaints");
  const LIMIT = 15;

  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const message = event.target.value;
    setState((prevState) => ({ ...prevState, message }));
  }
  function handleClassmateClick(studentNo: string) {
    setState((prevState) => ({ ...prevState, selectedChat: studentNo }));
  }
  function toggleModal(value: InitStateProps["showMayorModal"]) {
    setState((prevState) => ({ ...prevState, showMayorModal: value }));
  }

  const returnComplaintsQuery = useCallback(async () => {
    const thisYear = new Date().getFullYear();
    const nextYear = thisYear + 1;
    const formatYearStringify = `${thisYear}-${nextYear}`;
    const generatedQuery = query(
      complaintsCol,
      and(
        where("yearLevel", "==", state.currentStudent?.yearLevel),
        where("section", "==", state.currentStudent?.section),
        where("academicYear", "==", formatYearStringify)
      )
    );
    try {
      const snapshot = await getDocs(generatedQuery);
      if (snapshot.docs.length > 0) {
        const result = snapshot.docs[0];
        return { queryId: result ? result.id : "" };
      }
      const reference = await addDoc(complaintsCol, {
        time: new Date().getTime(),
        section: state.currentStudent?.section,
        yearLevel: state.currentStudent?.yearLevel,
        academicYear: formatYearStringify,
      });
      return { queryId: reference.id };
    } catch (err) {
      console.log(err, "Error in returning complaints Query");
    }
  }, [
    complaintsCol,
    state.currentStudent?.section,
    state.currentStudent?.yearLevel,
  ]);
  const fetchStudentInfo = useCallback(async () => {
    const studentSnapshot = await getDocs(
      query(collectionRef("student"), where("email", "==", currentUser?.email))
    );
    const mayorSnapshot = await getDocs(
      query(collectionRef("mayor"), where("email", "==", currentUser?.email))
    );
    if (!studentSnapshot.empty) {
      const doc = studentSnapshot.docs[0];
      const data = doc?.data() as StudentWithClassSection;
      setState((prevState) => ({
        ...prevState,
        currentStudent: data,
        role: "student",
      }));
    }
    if (!mayorSnapshot.empty) {
      setState((prevState) => ({ ...prevState, role: "mayor" }));
    }
  }, [currentUser]);
  /**TODO: Add onSnapshot for concerns turn-over to higher ups */
  const getChattablesForStudent = useCallback(async () => {
    try {
      const mayorSnapshot = await getDocs(
        query(
          collectionRef("mayor"),
          and(
            where("yearLevel", "==", state.currentStudent?.yearLevel),
            where("section", "==", state.currentStudent?.section)
          )
        )
      );
      const reference = await returnComplaintsQuery();
      if (!mayorSnapshot.empty) {
        const doc = mayorSnapshot.docs[0];
        const data = doc?.data() as StudentWithClassSection;
        setState((prevState) => ({
          ...prevState,
          mayor: data,
        }));
      }
      if (reference !== undefined) {
        const groupComplaintsCol = collection(
          doc(complaintsCol, reference.queryId),
          "group"
        );
        return onSnapshot(groupComplaintsCol, (groupSnapshot) => {
          const groupComplaintsHolder: ConcernBasePropsExtended[] = [];
          groupSnapshot.forEach((snap) => {
            const data = snap.data() as ConcernBaseProps;
            const id = snap.id;
            groupComplaintsHolder.push({ ...data, id });
          });
          setState((prevState) => ({
            ...prevState,
            groupComplaints: groupComplaintsHolder,
          }));
        });
      }
    } catch (err) {
      console.log(err, "Error in getting other chattables for student");
    }
  }, [state.currentStudent, complaintsCol, returnComplaintsQuery]);
  const fetchStudentConcerns = useCallback(async () => {
    try {
      const reference = await returnComplaintsQuery();

      async function fetchComplaintCollections(
        targetDocument: DocumentReference<DocumentData, DocumentData>
      ) {
        const groupComplaintCol = collection(targetDocument, "group");
        const individualComplaintCol = collection(targetDocument, "individual");
        const groupCOmplaints = await getDocs(
          query(groupComplaintCol, limit(LIMIT))
        );
        const groupComplaintsHolder: InitStateProps["groupComplaints"] = [];
        groupCOmplaints.forEach((doc) => {
          const data = doc.data() as ConcernBaseProps;
          const id = doc.id;
          groupComplaintsHolder.push({ ...data, id });
        });
        return onSnapshot(
          query(
            individualComplaintCol,
            where("recipient", "==", "mayor"),
            limit(LIMIT)
          ),
          (individualSnap) => {
            const individualComplaintHolder: InitStateProps["complaintRecord"] =
              [];
            individualSnap.forEach((doc) => {
              const data = doc.data() as ConcernProps;
              const id = doc.id;
              individualComplaintHolder.push({ ...data, id });
            });
            setState((prevState) => ({
              ...prevState,
              targetDocument: targetDocument,
              complaintRecord: individualComplaintHolder,
              groupComplaints: groupComplaintsHolder,
            }));
          }
        );
      }

      if (reference !== undefined) {
        const targetDocument = doc(complaintsCol, reference.queryId);
        return fetchComplaintCollections(targetDocument);
      }
    } catch (err) {
      console.log(err, "fetch student concerns");
    }
  }, [complaintsCol, returnComplaintsQuery]);

  async function handleSend(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const complaint: ConcernBaseProps = {
      timestamp: new Date().getTime(),
      sender: state.currentStudent?.studentNo ?? "anonymous",
      message: state.message,
    };
    if (state.targetDocument !== undefined) {
      if (typeof state.selectedChat === "object") {
        const data: ConcernProps = {
          messages: [complaint],
          ...state.selectedChat,
        };
        try {
          const document = await addDoc(
            collection(state.targetDocument, "individual"),
            data
          );
          return setState((prevState) => ({
            ...prevState,
            message: initState.message,
            selectedChat: document.id,
          }));
        } catch (err) {
          console.log(err, "sending message through complaints => individual");
        }
      } else if (state.selectedChat === "class_section") {
        const addedDocument = await addDoc(
          collection(state.targetDocument, "group"),
          complaint
        );
        return console.log({ addedDocument: addedDocument.id });
      } else if (!isNaN(Number(state.selectedChat))) {
        return console.log("Mayor is chatting", state.selectedChat);
      } else {
        /** This is for student forwarding messages to the existing complaint */
        const docRef = doc(
          collection(state.targetDocument, "individual"),
          state.selectedChat
        );
        try {
          await updateDoc(docRef, {
            messages: arrayUnion(complaint),
          });
          return setState((prevState) => ({
            ...prevState,
            message: initState.message,
          }));
        } catch (err) {
          return console.log(err, "Failed in updating document");
        }
      }
    }
    console.log("Individual Complaints Collection in state is undefined");
  }
  function handleNewConcern() {
    const concernDetails: Omit<ConcernProps, "messages"> = {
      dateCreated: new Date().getTime(),
      recipient: "mayor",
      status: "processing",
    };
    setState((prevState) => ({
      ...prevState,
      selectedChat: concernDetails,
      chatBox: initState.chatBox,
      showMayorModal: false,
    }));
  }
  function handleSelectComplaintId(id: typeof state.selectedChat) {
    if (typeof id === "string") {
      const chatBox = id;
      return setState((prevState) => ({
        ...prevState,
        selectedChat: id,
        showMayorModal: false,
        chatBox,
      }));
    }
    console.log("selected chat is not a string in state");
  }

  const mayorSetup = useCallback(() => {
    const studentQuery = query(
      collectionRef("student"),
      and(
        where("yearLevel", "==", state.currentStudent?.yearLevel),
        where("section", "==", state.currentStudent?.section),
        where("email", "!=", state.currentStudent?.email)
      )
    );
    return onSnapshot(studentQuery, (snapshot) => {
      const studentHolder: InitStateProps["classMates"] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as StudentWithClassSection;
        studentHolder.push(data);
      });
      setState((prevState) => ({ ...prevState, classMates: studentHolder }));
    });
  }, [
    state.currentStudent?.email,
    state.currentStudent?.section,
    state.currentStudent?.yearLevel,
  ]);

  const renderStudentComplainBox = () => {
    const array =
      state.selectedChat === "class_section"
        ? state.groupComplaints?.sort((a, b) => a.timestamp - b.timestamp)
        : state.complaintRecord
            ?.filter((props) => props.id === state.chatBox)[0]
            ?.messages.sort((a, b) => a.timestamp - b.timestamp);

    return array?.map(({ message, timestamp, sender }, index) => {
      const newTimestamp = new Date();
      newTimestamp.setTime(timestamp);
      return (
        <div
          key={index}
          className={`${
            sender === state.currentStudent?.studentNo
              ? "self-end"
              : "self-start"
          }`}
        >
          <p>{sender}</p>
          <p>{message}</p>
          <p>{newTimestamp.toTimeString()}</p>
        </div>
      );
    });
  };
  const renderStudentUI = () => {
    return (
      <div>
        <div className="flex w-screen gap-2 overflow-x-auto">
          <button
            className="rounded-xl bg-primary p-2 text-white"
            onClick={() => {
              toggleModal(true);
              setState((prevState) => ({ ...prevState, selectedChat: "" }));
            }}
          >{`Mayor: ${state.mayor?.name}`}</button>
          <button
            className="rounded-xl bg-primary p-2 text-white"
            onClick={() => {
              setState((prevState) => ({
                ...prevState,
                selectedChat: "class_section",
                message: initState.message,
                showMayorModal: false,
              }));
            }}
          >{`Class Section`}</button>
        </div>
        <div
          className={`${state.showMayorModal ? "block" : "hidden"} bg-paper`}
        >
          <button
            onClick={() => toggleModal(false)}
            className="rounded-full bg-red-400 px-2 text-white"
          >
            x
          </button>
          <>
            <h2>Complaint/Concern(s):</h2>
            <div className="flex h-64 flex-col gap-2 overflow-y-auto p-2">
              {state.complaintRecord?.map(({ id, messages, dateCreated }) => {
                const selectedMessage = messages[messages.length - 1];
                const date = new Date();
                const timestamp = new Date();
                date.setTime(dateCreated);
                timestamp.setTime(selectedMessage?.timestamp ?? -28800000);
                return (
                  <button
                    key={id}
                    className="mx-auto w-max border border-black bg-paper"
                    onClick={() => handleSelectComplaintId(id)}
                  >
                    <p>{`Message: ${selectedMessage?.message.substring(
                      0,
                      selectedMessage.message.length > 20
                        ? 15
                        : selectedMessage.message.length
                    )}...`}</p>
                    <p>{`SenderId: ${selectedMessage?.sender}`}</p>
                    <p>{timestamp.toTimeString()}</p>
                    <p>{date.toUTCString()}</p>
                  </button>
                );
              })}
            </div>
          </>
          <button onClick={handleNewConcern}>
            Create new Complaint/Concern(s)
          </button>
        </div>
      </div>
    );
  };
  const renderInputMessageContainer = () => {
    const placeholder =
      state.selectedChat === "class_section"
        ? "Compose a message to send in your class section"
        : state.chatBox === undefined && state.role !== "mayor"
        ? "Compose a new complaint"
        : "Compose a message";
    return (
      <div>
        <textarea
          placeholder={placeholder}
          value={state.message}
          onChange={handleMessage}
        />
        <button onClick={(e) => void handleSend(e)}>send</button>
      </div>
    );
  };

  useEffect(() => {
    void fetchStudentInfo();
    if (state.currentStudent !== undefined) {
      if (state.role === "mayor") {
        mayorSetup();
      } else {
        void getChattablesForStudent();
        void fetchStudentConcerns();
      }
    }
  }, [
    fetchStudentInfo,
    state.role,
    fetchStudentConcerns,
    getChattablesForStudent,
    mayorSetup,
    state.currentStudent,
  ]);

  return (
    <main>
      <p className="capitalize">{`${state.role} ${state.currentStudent?.name}`}</p>
      <section>
        {state.role === "mayor" ? (
          <>
            <h2>My Classmates:</h2>
            <div className="mx-auto flex w-5/6 overflow-x-auto">
              {state.classMates?.map(({ studentNo, name }) => {
                return (
                  <div key={studentNo}>
                    <button onClick={() => handleClassmateClick(studentNo)}>
                      {name}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          renderStudentUI()
        )}
      </section>
      <div className="flex h-[60vh] flex-col overflow-y-auto">
        {renderStudentComplainBox()}
      </div>
      {state.selectedChat !== undefined &&
        state.selectedChat !== "" &&
        renderInputMessageContainer()}
    </main>
  );
};

export default Complaints;
