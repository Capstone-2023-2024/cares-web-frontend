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
  increment,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";
import type { ConcernBaseProps, ConcernProps } from "~/types/complaints";
import { collectionRef } from "~/types/firebase";
import type { StudentWithClassSection } from "~/types/student";
import { db } from "~/utils/firebase";

interface ConcernPropsExtended extends ConcernProps {
  id: string;
}
interface ConcernBasePropsExtended extends ConcernBaseProps {
  id: string;
}
interface YearLevelSectionProps {
  yearLevel: string;
  section: StudentWithClassSection["section"];
}
interface MayorSetUpProps extends YearLevelSectionProps {
  studentNo: string;
}
interface FetchComplaintCollectionsProps {
  targetDocument: DocumentReference<DocumentData, DocumentData>;
  studentNo?: string;
  targetStateContainer: "complaintRecord" | "higherUpComplaintRecord";
  recipient: InitStateProps["role"];
}
interface InitStateProps {
  role?: "student" | "mayor" | "adviser";
  mayor?: StudentWithClassSection;
  adviser?: string;
  chatBox?: string;
  classMates?: StudentWithClassSection[];
  targetDocument?: DocumentReference<DocumentData, DocumentData>;
  currentStudent?: StudentWithClassSection;
  complaintRecord?: ConcernPropsExtended[];
  higherUpComplaintRecord?: ConcernPropsExtended[];
  groupComplaints?: ConcernBasePropsExtended[];
  message: string;
  turnOverMessage: string;
  selectedChat: string | Omit<ConcernProps, "messages">;
  selectedStudent: string | null;
  showMayorModal: boolean;
  showClassmates: boolean;
  showTurnOverPopUp: boolean;
}

const Complaints = () => {
  const initState: InitStateProps = {
    message: "",
    selectedChat: "",
    turnOverMessage: "",
    selectedStudent: null,
    showMayorModal: false,
    showClassmates: false,
    showTurnOverPopUp: false,
  };
  const LIMIT = 15;
  const { currentUser } = useAuth();
  const [state, setState] = useState(initState);
  /**Don't include in react-native */
  const router = useRouter();

  function handleTurnOverMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const turnOverMessage = event.target.value;
    setState((prevState) => ({ ...prevState, turnOverMessage }));
  }
  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const message = event.target.value;
    setState((prevState) => ({ ...prevState, message }));
  }
  function handleClassmateClick(studentNo: string) {
    setState((prevState) => ({ ...prevState, selectedStudent: studentNo }));
  }
  function toggleModal(value: boolean) {
    setState((prevState) => ({ ...prevState, showMayorModal: value }));
  }
  function toggleTurnOver(value: boolean) {
    setState((prevState) => ({ ...prevState, showTurnOverPopUp: value }));
  }
  function toggleClassmates(value: boolean) {
    setState((prevState) => ({ ...prevState, showClassmates: value }));
  }

  const returnComplaintsQuery = useCallback(
    async ({ yearLevel, section }: YearLevelSectionProps) => {
      const thisYear = new Date().getFullYear();
      const nextYear = thisYear + 1;
      const formatYearStringify = `${thisYear}-${nextYear}`;
      const generatedQuery = query(
        collectionRef("complaints"),
        and(
          where("yearLevel", "==", yearLevel),
          where("section", "==", section),
          where("academicYear", "==", formatYearStringify)
        )
      );
      try {
        const snapshot = await getDocs(generatedQuery);
        if (snapshot.docs.length > 0) {
          const result = snapshot.docs[0];
          return { queryId: result ? result.id : "" };
        }
        const reference = await addDoc(collectionRef("complaints"), {
          time: new Date().getTime(),
          section,
          yearLevel,
          academicYear: formatYearStringify,
        });
        return { queryId: reference.id };
      } catch (err) {
        console.log(err, "Error in returning complaints Query");
      }
    },
    []
  );
  /** Setting up currentStudent, and role `mayor` or `student` in state */
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
  }, [currentUser?.email]);
  /**TODO: Store classmate info into Local Storage */
  const fetchClassMatesInfo = useCallback(
    ({ yearLevel, section }: YearLevelSectionProps) => {
      const studentQuery = query(
        collectionRef("student"),
        and(
          where("yearLevel", "==", yearLevel),
          where("section", "==", section)
        )
      );
      return onSnapshot(studentQuery, (snapshot) => {
        const studentHolder: StudentWithClassSection[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as StudentWithClassSection;
          studentHolder.push(data);
        });
        setState((prevState) => ({
          ...prevState,
          classMates: studentHolder,
        }));
      });
    },
    []
  );
  /**TODO: Add onSnapshot for concerns turn-over to higher ups */
  const getChattablesForStudent = useCallback(
    async ({ yearLevel, section }: YearLevelSectionProps) => {
      try {
        const mayorSnapshot = await getDocs(
          query(
            collectionRef("mayor"),
            and(
              where("yearLevel", "==", yearLevel),
              where("section", "==", section)
            )
          )
        );
        const reference = await returnComplaintsQuery({
          yearLevel,
          section,
        });
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
            doc(collectionRef("complaints"), reference.queryId),
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
    },
    [returnComplaintsQuery]
  );
  /** if role is === `mayor`, recipient is set to `adviser` and if called in student follow-up set-up, studentNo should be undefined */
  const fetchComplaintCollections = useCallback(
    async ({
      targetDocument,
      studentNo,
      recipient,
      targetStateContainer,
    }: FetchComplaintCollectionsProps) => {
      const groupComplaintCol = collection(targetDocument, "group");
      const individualComplaintCol = collection(targetDocument, "individual");
      const groupCOmplaints = await getDocs(
        query(groupComplaintCol, limit(LIMIT))
      );
      const groupComplaintsHolder: ConcernBasePropsExtended[] = [];
      groupCOmplaints.forEach((doc) => {
        const data = doc.data() as ConcernBaseProps;
        const id = doc.id;
        groupComplaintsHolder.push({ ...data, id });
      });

      return onSnapshot(
        studentNo === undefined
          ? query(
              individualComplaintCol,
              where("recipient", "==", recipient),
              limit(LIMIT * 3)
            )
          : query(
              individualComplaintCol,
              and(
                where("recipient", "==", recipient),
                where("studentNo", "==", studentNo)
              ),
              limit(LIMIT)
            ),
        (individualSnap) => {
          const concernsHolder: ConcernPropsExtended[] = [];
          individualSnap.forEach((doc) => {
            const data = doc.data() as ConcernProps;
            const id = doc.id;
            concernsHolder.push({ ...data, id });
          });
          setState((prevState) => ({
            ...prevState,
            targetDocument: targetDocument,
            [targetStateContainer]: concernsHolder,
            groupComplaints: groupComplaintsHolder,
          }));
        }
      );
    },
    []
  );
  /**TODO: reference this in `adviser` role setup. __________________________________/
   * Setup `targetDocument`, `complaintRecord`, and `groupComplaints` in state.*/
  const fetchStudentConcerns = useCallback(
    async ({
      yearLevel,
      section,
      studentNo,
    }: Omit<MayorSetUpProps, "email">) => {
      try {
        const reference = await returnComplaintsQuery({
          yearLevel,
          section,
        });

        if (reference !== undefined) {
          const targetDocument = doc(
            collectionRef("complaints"),
            reference.queryId
          );
          const fetchComplaintProps: FetchComplaintCollectionsProps = {
            targetDocument,
            recipient: "mayor",
            targetStateContainer: "complaintRecord",
          };
          return void fetchComplaintCollections(
            state.role === "mayor"
              ? fetchComplaintProps
              : { studentNo, ...fetchComplaintProps }
          );
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [state.role, returnComplaintsQuery, fetchComplaintCollections]
  );
  /** Setup Classmates concerns, and concern for Adviser */
  const mayorSetup = useCallback(
    async ({ yearLevel, section, studentNo }: MayorSetUpProps) => {
      try {
        const reference = await returnComplaintsQuery({
          yearLevel,
          section,
        });

        if (reference !== undefined) {
          const targetDocument = doc(
            collectionRef("complaints"),
            reference.queryId
          );

          return void fetchComplaintCollections({
            targetDocument,
            recipient: "adviser",
            targetStateContainer: "higherUpComplaintRecord",
            studentNo: studentNo,
          });
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [fetchComplaintCollections, returnComplaintsQuery]
  );
  /** If sender is anonymous, currentStudent is not loaded properly */
  async function handleSend(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const complaint: ConcernBaseProps = {
      timestamp: new Date().getTime(),
      sender: state.currentStudent?.studentNo ?? "anonymous",
      message: state.message,
    };
    if (state.targetDocument !== undefined) {
      if (typeof state.selectedChat === "object") {
        /** concernDetails enters here */
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
            chatBox: document.id,
          }));
        } catch (err) {
          console.log(err, "sending message through complaints => individual");
        }
      } else if (state.selectedChat === "class_section") {
        await addDoc(collection(state.targetDocument, "group"), complaint);
        setState((prevState) => ({
          ...prevState,
          message: initState.message,
        }));
        return console.log("new log");
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
  /** If role is `mayor` it is directed to `adviser`, else if role is `student` it is directed to `mayor` */
  function handleNewConcern() {
    if (state.currentStudent?.studentNo !== undefined) {
      const concernDetails: Omit<ConcernProps, "messages"> = {
        dateCreated: new Date().getTime(),
        recipient: state.role === "mayor" ? "adviser" : "mayor",
        studentNo: state.currentStudent.studentNo,
        status: "processing",
      };
      return setState((prevState) => ({
        ...prevState,
        selectedChat: concernDetails,
        chatBox: initState.chatBox,
        showMayorModal: false,
      }));
    }
    alert("studentNo is undefined");
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

  const renderStudentComplainBox = () => {
    /**state.higherUpComplaintRecord === 0 */
    const complaintRecord = state.complaintRecord?.filter(
      (props) => state.selectedChat === props.id
    );
    const higherUpComplaintRecord = state.higherUpComplaintRecord?.filter(
      (props) => state.selectedChat === props.id
    );
    const complaintRecordCondition =
      complaintRecord !== undefined && complaintRecord.length > 0
        ? complaintRecord
        : [];
    const higherUpComplaintRecordCondition =
      higherUpComplaintRecord !== undefined &&
      higherUpComplaintRecord.length > 0
        ? higherUpComplaintRecord
        : [];
    const conditionalArray = [
      ...(complaintRecordCondition.length > 0
        ? complaintRecordCondition
        : higherUpComplaintRecordCondition),
    ].filter((props) => props.id === state.chatBox)[0];
    console.log({ conditionalArray });
    const renderThisArray =
      state.selectedChat === "class_section"
        ? state.groupComplaints?.sort((a, b) => a.timestamp - b.timestamp)
        : conditionalArray?.messages.sort((a, b) => a.timestamp - b.timestamp);
    async function actionButton(type: "resolved" | "turn-over") {
      try {
        if (typeof state.selectedChat === "string") {
          const reference = await returnComplaintsQuery({
            yearLevel: state.currentStudent?.yearLevel ?? "null",
            section: state.currentStudent?.section,
          });
          if (reference !== undefined) {
            const individualColRef = collection(
              doc(db, "complaints", reference.queryId),
              "individual"
            );
            const targetDoc = doc(individualColRef, state.selectedChat);
            if (type === "resolved") {
              await updateDoc(targetDoc, { status: type });
            } else if (type === "turn-over") {
              await updateDoc(targetDoc, {
                status: type,
                turnOvers: increment(1),
              });
              await addDoc(individualColRef, {
                dateCreated: new Date().getTime(),
                referenceId: state.selectedChat,
                messages: [
                  {
                    sender: state.currentStudent?.studentNo,
                    message: state.turnOverMessage,
                    timestamp: new Date().getTime(),
                  },
                ],
                recipient: "adviser",
                status: "processing",
                studentNo:
                  state.complaintRecord?.filter(
                    (props) => state.selectedChat === props.id
                  )[0]?.studentNo ?? "null",
              });
            }
          }
        }
      } catch (err) {
        console.log(err, "Action Button");
      }
    }

    return (
      <>
        {state.selectedChat !== "" && (
          <div className="bg-primary/20 p-2 text-center">
            <p className="text-xl font-bold">
              {state.selectedChat === "class_section"
                ? "Class Section"
                : complaintRecordCondition.length > 0 && state.role !== "mayor"
                ? `Mayor ${state.mayor?.name.split(",")[0]}`
                : complaintRecordCondition.length > 0
                ? state.classMates?.filter(
                    (stud) =>
                      state.complaintRecord?.filter(
                        (props) => props.id === state.selectedChat
                      )[0]?.studentNo === stud.studentNo
                  )[0]?.name
                : state.role === "mayor"
                ? "Adviser"
                : `Mayor ${state.mayor?.name.split(",")[0]}`}
            </p>
            {typeof state.selectedChat === "string" &&
              state.selectedChat !== "class_section" && (
                <>
                  <p className="font-semibold text-primary">
                    {`Concern Id: ${state.selectedChat}`}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    Status:
                    <span
                      className={`${
                        conditionalArray?.status === "processing"
                          ? "text-yellow-500"
                          : conditionalArray?.status === "resolved"
                          ? "text-green-500"
                          : "text-red-500"
                      } font-bold capitalize`}
                    >
                      {conditionalArray?.status === "processing"
                        ? "ongoing"
                        : conditionalArray?.status}
                    </span>
                  </p>
                </>
              )}
            {state.complaintRecord?.filter(
              (props) => props.id === state.selectedChat
            ) !== undefined &&
              state.complaintRecord?.filter(
                (props) => props.id === state.selectedChat
              ).length > 0 &&
              conditionalArray?.status === "processing" && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="rounded-lg bg-green-500 p-2 capitalize text-paper"
                    onClick={() => void actionButton("resolved")}
                  >
                    resolve
                  </button>
                  <button
                    className="rounded-lg bg-yellow-500 p-2 capitalize text-paper"
                    onClick={() => toggleTurnOver(true)}
                  >
                    turn-over
                  </button>
                  {state.showTurnOverPopUp && (
                    <div className="fixed inset-0 bg-blue-400">
                      <button
                        className="absolute right-2 top-2 rounded-full bg-red-500 px-2"
                        onClick={() => toggleTurnOver(false)}
                      >
                        <p className="text-white">x</p>
                      </button>
                      <textarea
                        className="p-2"
                        placeholder="Compose a turn-over message to send to your adviser"
                        value={state.turnOverMessage}
                        onChange={handleTurnOverMessage}
                      />
                      <button
                        disabled={state.turnOverMessage.trim() === ""}
                        className={`${
                          state.turnOverMessage.trim() === ""
                            ? "bg-slate-200 text-slate-300"
                            : "bg-green text-paper"
                        } rounded-lg p-2 capitalize duration-300 ease-in-out`}
                        onClick={() => void actionButton("turn-over")}
                      >
                        send
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
        <div className="flex h-[60vh] flex-col gap-2 overflow-y-auto bg-primary/10 p-2">
          {renderThisArray?.map(({ message, timestamp, sender }, index) => {
            const newTimestamp = new Date();
            newTimestamp.setTime(timestamp);
            const targetStudent = state.classMates?.filter(
              (props) => sender === props.studentNo
            )[0];

            return (
              <ProfilePictureContainer
                key={index}
                src={targetStudent?.src ?? ""}
                renderCondition={sender === state.currentStudent?.studentNo}
              >
                <div className="relative">
                  <div>
                    <p className="font-bold">
                      {targetStudent?.name ?? "not_student"}
                    </p>
                    <p className="font-bold text-primary">{sender}</p>
                    <p>{message}</p>
                    <p className="text-xs font-thin">
                      {newTimestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {state.role === "mayor" &&
                    state.adviser === undefined &&
                    typeof state.selectedChat === "string" &&
                    state.higherUpComplaintRecord?.filter(
                      (props) => state.selectedChat === props.id
                    ) !== undefined &&
                    state.higherUpComplaintRecord?.filter(
                      (props) => state.selectedChat === props.id
                    ).length > 0 && (
                      <p className="absolute inset-x-0 bottom-1/2 rounded-lg bg-yellow-100 p-2">
                        <span className="text-yellow-800">
                          Note: No active adviser.
                        </span>
                      </p>
                    )}
                </div>
              </ProfilePictureContainer>
            );
          })}
        </div>
      </>
    );
  };
  /**TODO: Optimized this together with Mayor UI */
  const renderInputMessageContainer = () => {
    const placeholder =
      state.selectedChat === "class_section"
        ? "Compose a message to send in your class section"
        : state.chatBox === undefined && state.role !== "mayor"
        ? "Compose a new complaint"
        : "Compose a message";

    const complaintRecord =
      state.complaintRecord?.filter(
        (props) => props.id === state.selectedChat
      ) ?? [];
    const higherUpComplaintRecord =
      state.higherUpComplaintRecord?.filter(
        (props) => props.id === state.selectedChat
      ) ?? [];
    const renderCondition =
      (complaintRecord.length > 0 &&
        complaintRecord[0]?.status === "processing") ||
      (higherUpComplaintRecord.length > 0 &&
        higherUpComplaintRecord[0]?.status === "processing");

    return (
      <div
        className={`${
          renderCondition ||
          typeof state.selectedChat === "object" ||
          state.selectedChat === "class_section"
            ? "block"
            : "hidden"
        }`}
      >
        <textarea
          placeholder={placeholder}
          value={state.message}
          onChange={handleMessage}
        />
        <button onClick={(e) => void handleSend(e)}>send</button>
      </div>
    );
  };

  /** Student initial Set-up */
  useEffect(() => {
    return void fetchStudentInfo();
  }, [fetchStudentInfo]);
  /** Student follow-up Set-up */
  useEffect(() => {
    const yearLevel = state.currentStudent?.yearLevel;
    const section = state.currentStudent?.section;
    const studentNo = state.currentStudent?.studentNo;
    if (
      yearLevel !== undefined &&
      section !== undefined &&
      studentNo !== undefined
    ) {
      void fetchClassMatesInfo({ yearLevel, section });
      void getChattablesForStudent({ yearLevel, section });
      void fetchStudentConcerns({ yearLevel, section, studentNo });
    }
  }, [
    state.currentStudent?.section,
    state.currentStudent?.studentNo,
    state.currentStudent?.yearLevel,
    fetchClassMatesInfo,
    getChattablesForStudent,
    fetchStudentConcerns,
  ]);
  /** Mayor Set-up */
  useEffect(() => {
    const yearLevel = state.currentStudent?.yearLevel;
    const section = state.currentStudent?.section;
    const studentNo = state.currentStudent?.studentNo;
    if (
      state.role === "mayor" &&
      yearLevel !== undefined &&
      section !== undefined &&
      studentNo !== undefined
    ) {
      void mayorSetup({ yearLevel, section, studentNo });
    }
  }, [
    state.role,
    state.currentStudent?.studentNo,
    state.currentStudent?.yearLevel,
    state.currentStudent?.section,
    mayorSetup,
  ]);
  /**Don't include in react native */
  useEffect(() => {
    async function setup() {
      try {
        if (currentUser === null) {
          await router.replace("login");
        }
      } catch (err) {
        console.log(err);
      }
    }
    return void setup();
  }, [currentUser, router]);

  if (state.role === undefined) {
    return <Loading />;
  }

  return (
    <Main>
      <section className="h-full">
        {state.role === "mayor" ? (
          <>
            <RenderStudentUI
              selectedChat={state.selectedChat}
              handleNewConcern={handleNewConcern}
              role={state.role}
              mayor={state.mayor}
              data={[
                ...((state.role === "mayor"
                  ? state.higherUpComplaintRecord
                  : state.complaintRecord) ?? []),
              ].sort((a, b) => b.dateCreated - a.dateCreated)}
              condition={state.showMayorModal}
              setId={handleSelectComplaintId}
              closingCondition={() => toggleModal(false)}
              higherUpAction={() => {
                toggleModal(true);
                toggleClassmates(false);
                setState((prevState) => ({
                  ...prevState,
                  selectedStudent: null,
                }));
              }}
              classSectionAction={() => {
                setState((prevState) => ({
                  ...prevState,
                  selectedChat: "class_section",
                  message: initState.message,
                  showMayorModal: false,
                }));
              }}
            >
              <button
                onClick={() => {
                  toggleClassmates(!state.showClassmates);
                  toggleModal(false);
                }}
                className={`${
                  state.complaintRecord?.filter(
                    (props) => state.selectedChat === props.id
                  ) !== undefined &&
                  state.complaintRecord?.filter(
                    (props) => state.selectedChat === props.id
                  ).length > 0
                    ? "bg-secondary"
                    : "bg-primary"
                } rounded-xl p-2 text-white duration-300 ease-in-out`}
              >
                My Classmates
              </button>
            </RenderStudentUI>
            <div
              className={`${
                state.showClassmates ? "flex" : "hidden"
              } mx-auto w-full gap-2 overflow-x-auto bg-secondary p-2`}
            >
              {state.classMates
                ?.filter((props) => props.email !== state.currentStudent?.email)
                ?.map(({ studentNo, name, src }) => {
                  return (
                    <button
                      key={studentNo}
                      onClick={() => {
                        handleClassmateClick(studentNo);
                      }}
                    >
                      <ProfilePictureContainer src={src ?? ""}>
                        <div className="text-start">
                          <p className="font-bold">{name}</p>
                          <p className="font-bold text-primary">{studentNo}</p>
                        </div>
                      </ProfilePictureContainer>
                    </button>
                  );
                })}
            </div>
            <ComplainBoxRenderer
              data={state.complaintRecord
                ?.filter((props) => props.studentNo === state.selectedStudent)
                ?.sort((a, b) => b.dateCreated - a.dateCreated)}
              heading={`${
                state.classMates
                  ?.filter(
                    (props) => state.selectedStudent === props.studentNo
                  )[0]
                  ?.name.split(",")[0]
              }'s Complaint/Concern(s):`}
              condition={state.selectedStudent !== null}
              setId={handleSelectComplaintId}
              setIdExtended={() => {
                toggleClassmates(false);
                setState((prevState) => ({
                  ...prevState,
                  selectedStudent: null,
                }));
              }}
              closingCondition={() =>
                setState((prevState) => ({
                  ...prevState,
                  selectedStudent: null,
                }))
              }
            />
          </>
        ) : (
          <RenderStudentUI
            selectedChat={state.selectedChat}
            handleNewConcern={handleNewConcern}
            role={state.role}
            mayor={state.mayor}
            data={state.complaintRecord?.sort(
              (a, b) => b.dateCreated - a.dateCreated
            )}
            condition={state.showMayorModal}
            setId={handleSelectComplaintId}
            closingCondition={() => toggleModal(false)}
            higherUpAction={() => {
              toggleModal(true);
              setState((prevState) => ({
                ...prevState,
                selectedStudent: null,
              }));
            }}
            classSectionAction={() => {
              setState((prevState) => ({
                ...prevState,
                selectedChat: "class_section",
                message: initState.message,
                showMayorModal: false,
              }));
            }}
          />
        )}
        {renderStudentComplainBox()}
        {state.selectedChat !== undefined &&
          state.selectedChat !== "" &&
          renderInputMessageContainer()}
      </section>
    </Main>
  );
};

interface RenderStudentUIProps
  extends Pick<InitStateProps, "role" | "mayor">,
    ComplainBoxRendererProps {
  selectedChat: InitStateProps["selectedChat"];
  children?: ReactNode;
  higherUpAction: () => void;
  classSectionAction: () => void;
}
const RenderStudentUI = ({
  role,
  mayor,
  children,
  selectedChat,
  higherUpAction,
  classSectionAction,
  ...rest
}: RenderStudentUIProps) => {
  const higherUpName = role === "mayor" ? `Adviser` : `Mayor: ${mayor?.name}`;
  return (
    <div className="bg-primary/30 p-2">
      <div className="flex w-full flex-row gap-2 overflow-x-auto">
        <button
          className={`${
            (rest.data?.filter((props) => props.id === selectedChat) !==
              undefined &&
              rest.data?.filter((props) => props.id === selectedChat).length >
                0) ||
            typeof selectedChat === "object"
              ? "bg-secondary"
              : "bg-primary"
          } rounded-xl p-2 text-white duration-300 ease-in-out`}
          onClick={higherUpAction}
        >
          {higherUpName}
        </button>
        <button
          className={`${
            selectedChat === "class_section" ? "bg-secondary" : "bg-primary"
          } rounded-xl p-2 text-white duration-300 ease-in-out`}
          onClick={classSectionAction}
        >{`Class Section`}</button>
        {children}
      </div>
      <ComplainBoxRenderer {...rest} />
    </div>
  );
};

interface ComplainBoxRendererProps {
  data: ConcernPropsExtended[] | undefined;
  heading?: string;
  condition: boolean;
  setId: (id: string | Omit<ConcernProps, "messages">) => void;
  setIdExtended?: () => void;
  closingCondition: () => void;
  handleNewConcern?: () => void;
}
const ComplainBoxRenderer = ({
  data,
  heading,
  condition,
  setId,
  setIdExtended,
  closingCondition,
  handleNewConcern,
}: ComplainBoxRendererProps) => {
  return (
    <div
      className={`${
        condition ? "block" : "hidden"
      } relative bg-paper p-2 text-center`}
    >
      <button
        onClick={closingCondition}
        className="absolute right-2 top-2 rounded-full bg-red-400 px-2 text-white"
      >
        x
      </button>
      <>
        <h2 className="p-2 text-lg font-bold">
          {heading ? heading : "Your Complaint/Concern(s)"}
        </h2>
        <div className="flex w-full gap-2 overflow-x-auto p-2">
          {data?.map(({ id, messages, dateCreated, status }) => {
            const date = new Date();
            const timestamp = new Date();
            const selectedMessage = messages[messages.length - 1];

            date.setTime(dateCreated);
            timestamp.setTime(selectedMessage?.timestamp ?? -28800000);
            return (
              <button
                key={id}
                className="rounded-lg bg-secondary p-2 text-start text-paper shadow-sm"
                onClick={() => {
                  setIdExtended && setIdExtended();
                  setId(id);
                }}
              >
                <p className="text-sm text-primary">{`Concern Id: ${id}`}</p>
                <p className="text-sm">
                  Status:
                  <span
                    className={`${
                      status === "processing"
                        ? "text-yellow-500"
                        : status === "resolved"
                        ? "text-green-500"
                        : "text-red-400"
                    } pl-2 font-bold capitalize`}
                  >
                    {status === "processing" ? "ongoing" : status}
                  </span>
                </p>
                <p className="text-sm">{`Recent Message: ${selectedMessage?.message.substring(
                  0,
                  selectedMessage.message.length > 6
                    ? 4
                    : selectedMessage.message.length
                )}...`}</p>
                <p className="text-xs font-thin">{`Date: ${date.toLocaleDateString()}`}</p>
              </button>
            );
          })}
        </div>
      </>
      {handleNewConcern !== undefined && (
        <button
          className="mx-auto w-fit rounded-lg bg-green-400 p-2 text-white"
          onClick={handleNewConcern}
        >
          Create new Complaint/Concern(s)
        </button>
      )}
    </div>
  );
};

interface ProfilePictureContainerProps extends ProfilePictureProps {
  renderCondition?: boolean;
  children: ReactNode;
}
const ProfilePictureContainer = ({
  renderCondition,
  children,
  ...rest
}: ProfilePictureContainerProps) => {
  const additionalStyle = renderCondition
    ? "self-end bg-paper"
    : "self-start bg-blue-100";
  return (
    <div
      className={`${
        renderCondition === undefined ? "bg-paper" : additionalStyle
      } flex flex-row items-center justify-center gap-2 rounded-lg border border-primary p-2`}
    >
      <ProfilePicture {...rest} />
      {children}
    </div>
  );
};

interface ProfilePictureProps {
  src: string;
}
const ProfilePicture = ({ src }: ProfilePictureProps) => {
  const DIMENSION = 46;
  return (
    <div className="h-12 w-12">
      <Image
        src={src}
        alt="profile_picture"
        className="h-full w-full rounded-full"
        width={DIMENSION}
        height={DIMENSION}
      />
    </div>
  );
};

export default Complaints;
