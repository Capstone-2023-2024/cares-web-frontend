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
  type ReactNode,
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
interface YearLevelSectionProps {
  yearLevel: string;
  section: StudentWithClassSection["section"];
}
interface MayorSetUpProps extends YearLevelSectionProps {
  studentNo: string;
  email: string;
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
  selectedChat: string | Omit<ConcernProps, "messages">;
  selectedStudent: string | null;
  showMayorModal: boolean;
  showClassmates: boolean;
}
interface ComplainBoxRendererProps {
  data: ConcernPropsExtended[] | undefined;
  heading: string;
  condition: boolean;
  setId: (id: string | Omit<ConcernProps, "messages">) => void;
  setIdExtended?: () => void;
  closingCondition: () => void;
  handleNewConcern?: () => void;
}

const Complaints = () => {
  const initState: InitStateProps = {
    message: "",
    selectedChat: "",
    selectedStudent: null,
    showMayorModal: false,
    showClassmates: false,
  };
  const LIMIT = 15;
  const { currentUser } = useAuth();
  const [state, setState] = useState(initState);

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
    async ({ yearLevel, section, email, studentNo }: MayorSetUpProps) => {
      try {
        const reference = await returnComplaintsQuery({
          yearLevel,
          section,
        });
        const studentQuery = query(
          collectionRef("student"),
          and(
            where("yearLevel", "==", yearLevel),
            where("section", "==", section),
            where("email", "!=", email)
          )
        );

        const snapOne = onSnapshot(studentQuery, (snapshot) => {
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

        if (reference !== undefined) {
          const targetDocument = doc(
            collectionRef("complaints"),
            reference.queryId
          );

          void fetchComplaintCollections({
            targetDocument,
            recipient: "adviser",
            targetStateContainer: "higherUpComplaintRecord",
            studentNo: studentNo,
          });
          return snapOne;
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
    const array =
      state.selectedChat === "class_section"
        ? state.groupComplaints?.sort((a, b) => a.timestamp - b.timestamp)
        : [
            ...((state.complaintRecord?.filter(
              (props) => props.id === state.selectedChat
            ).length === 0
              ? state.higherUpComplaintRecord
              : state.complaintRecord) ?? []),
          ]
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
          {state.role === "mayor" &&
            state.adviser === undefined &&
            state.selectedChat === null && (
              <p className="relative z-10">
                <span className="absolute rounded-lg bg-yellow-100 p-2 text-yellow-800">
                  Note: You do not have a active adviser right now, however this
                  message will be recorded.
                </span>
              </p>
            )}
        </div>
      );
    });
  };
  /**TODO: Optimized this together with Mayor UI */

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
      void getChattablesForStudent({ yearLevel, section });
      void fetchStudentConcerns({ yearLevel, section, studentNo });
    }
  }, [
    state.currentStudent?.section,
    state.currentStudent?.studentNo,
    state.currentStudent?.yearLevel,
    getChattablesForStudent,
    fetchStudentConcerns,
  ]);
  /** Mayor Set-up */
  useEffect(() => {
    const email = state.currentStudent?.email;
    const yearLevel = state.currentStudent?.yearLevel;
    const section = state.currentStudent?.section;
    const studentNo = state.currentStudent?.studentNo;
    if (
      state.role === "mayor" &&
      email !== undefined &&
      yearLevel !== undefined &&
      section !== undefined &&
      studentNo !== undefined
    ) {
      void mayorSetup({ email, yearLevel, section, studentNo });
    }
  }, [
    state.role,
    state.currentStudent?.studentNo,
    state.currentStudent?.email,
    state.currentStudent?.yearLevel,
    state.currentStudent?.section,
    mayorSetup,
  ]);

  return (
    <main>
      <p className="capitalize">{`${state.role} ${state.currentStudent?.name}`}</p>
      <section>
        {state.role === "mayor" ? (
          <>
            <RenderStudentUI
              handleNewConcern={handleNewConcern}
              role={state.role}
              mayor={state.mayor}
              data={[
                ...((state.role === "mayor"
                  ? state.higherUpComplaintRecord
                  : state.complaintRecord) ?? []),
              ].sort((a, b) => b.dateCreated - a.dateCreated)}
              heading="Complaint/Concern(s):"
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
                  toggleClassmates(true);
                  toggleModal(false);
                }}
                className="rounded-xl bg-primary p-2 text-white"
              >
                My Classmates:
              </button>
            </RenderStudentUI>
            <div
              className={`${
                state.showClassmates ? "flex" : "hidden"
              } mx-auto w-5/6 overflow-x-auto`}
            >
              {state.classMates?.map(({ studentNo, name }) => {
                return (
                  <div key={studentNo}>
                    <button
                      onClick={() => {
                        handleClassmateClick(studentNo);
                      }}
                    >
                      {name}
                    </button>
                  </div>
                );
              })}
            </div>
            <ComplainBoxRenderer
              data={state.complaintRecord
                ?.filter((props) => props.studentNo === state.selectedStudent)
                ?.sort((a, b) => b.dateCreated - a.dateCreated)}
              heading={`${state.selectedStudent}'s Complaint/Concern(s):`}
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
            handleNewConcern={handleNewConcern}
            role={state.role}
            mayor={state.mayor}
            data={state.complaintRecord?.sort(
              (a, b) => b.dateCreated - a.dateCreated
            )}
            heading="Complaint/Concern(s):"
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

interface RenderStudentUIProps
  extends Pick<InitStateProps, "role" | "mayor">,
    ComplainBoxRendererProps {
  children?: ReactNode;
  higherUpAction: () => void;
  classSectionAction: () => void;
}

const RenderStudentUI = ({
  role,
  mayor,
  children,
  higherUpAction,
  classSectionAction,
  ...rest
}: RenderStudentUIProps) => {
  const higherUpName = role === "mayor" ? `Adviser: ` : `Mayor: ${mayor?.name}`;
  return (
    <div>
      <div className="flex w-screen gap-2 overflow-x-auto">
        <button
          className="rounded-xl bg-primary p-2 text-white"
          onClick={higherUpAction}
        >
          {higherUpName}
        </button>
        <button
          className="rounded-xl bg-primary p-2 text-white"
          onClick={classSectionAction}
        >{`Class Section`}</button>
        {children}
      </div>
      <ComplainBoxRenderer {...rest} />
    </div>
  );
};

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
    <div className={`${condition ? "block" : "hidden"} bg-paper`}>
      <button
        onClick={closingCondition}
        className="rounded-full bg-red-400 px-2 text-white"
      >
        x
      </button>
      <>
        <h2>{heading}</h2>
        <div className="flex h-64 flex-col gap-2 overflow-y-auto p-2">
          {data?.map(({ id, messages, dateCreated }) => {
            const date = new Date();
            const timestamp = new Date();
            const selectedMessage = messages[messages.length - 1];

            date.setTime(dateCreated);
            timestamp.setTime(selectedMessage?.timestamp ?? -28800000);
            return (
              <button
                key={id}
                className="mx-auto w-max border border-black bg-paper"
                onClick={() => {
                  setId(id);
                  setIdExtended && setIdExtended();
                }}
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
      {handleNewConcern !== undefined && (
        <button onClick={handleNewConcern}>
          Create new Complaint/Concern(s)
        </button>
      )}
    </div>
  );
};

export default Complaints;
