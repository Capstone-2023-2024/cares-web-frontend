import {
  addDoc,
  and,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
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
  recipient: InitStateProps["role"];
}
interface AdviserProps extends YearLevelSectionProps {
  dateCreated: number;
  email: string;
  src?: string;
  name?: string;
}
interface AdviserPropsExtended extends AdviserProps {
  id: string;
}
interface InitStateProps {
  role?: "student" | "mayor" | "adviser";
  mayor?: StudentWithClassSection;
  chatBox?: string;
  targetDocument?: DocumentReference<DocumentData, DocumentData>;
  classMates?: StudentWithClassSection[];
  currentStudent?: StudentWithClassSection;
  currentAdviser?: AdviserPropsExtended;
  message: string;
  selectedChat: string | Omit<ConcernProps, "messages">;
  selectedStudent: string | null;
  showMayorModal: boolean;
  showClassmates: boolean;
  showTurnOverPopUp: boolean;
}

interface ComplaintsProviderStateProps {
  toHigherUpComplaints: ConcernPropsExtended[];
  classSectionComplaints: ConcernBasePropsExtended[];
  currentStudentComplaints: ConcernPropsExtended[];
}
const complaintsInitState: ComplaintsProviderStateProps = {
  toHigherUpComplaints: [],
  classSectionComplaints: [],
  currentStudentComplaints: [],
};
interface ComplaintsContextProps extends ComplaintsProviderStateProps {
  setToHigherUp: (
    array: ComplaintsProviderStateProps["toHigherUpComplaints"]
  ) => void;
  setClassSection: (
    array: ComplaintsProviderStateProps["classSectionComplaints"]
  ) => void;
  setCurrentStudent: (
    array: ComplaintsProviderStateProps["currentStudentComplaints"]
  ) => void;
}
interface ComplaintsProviderProps {
  children: ReactNode;
}
const ComplaintsContext = createContext<ComplaintsContextProps>({
  ...complaintsInitState,
  setToHigherUp: () => null,
  setClassSection: () => null,
  setCurrentStudent: () => null,
});
const useComplaints = () => useContext(ComplaintsContext);
const ComplaintsProvider = ({ children }: ComplaintsProviderProps) => {
  const [state, setState] = useState(complaintsInitState);

  const setToHigherUp = useCallback(
    (
      toHigherUpComplaints: ComplaintsProviderStateProps["toHigherUpComplaints"]
    ) => {
      setState((prevState) => ({ ...prevState, toHigherUpComplaints }));
    },
    []
  );
  const setClassSection = useCallback(
    (
      classSectionComplaints: ComplaintsProviderStateProps["classSectionComplaints"]
    ) => {
      setState((prevState) => ({ ...prevState, classSectionComplaints }));
    },
    []
  );
  const setCurrentStudent = useCallback(
    (
      currentStudentComplaints: ComplaintsProviderStateProps["currentStudentComplaints"]
    ) => {
      setState((prevState) => ({ ...prevState, currentStudentComplaints }));
    },
    []
  );

  return (
    <ComplaintsContext.Provider
      value={{ ...state, setToHigherUp, setClassSection, setCurrentStudent }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
};

const LIMIT = 15;
const Complaints = () => {
  return (
    <Main>
      <ComplaintsProvider>
        <ComplaintsWrapper />
      </ComplaintsProvider>
    </Main>
  );
};

const ComplaintsWrapper = () => {
  const initState: InitStateProps = {
    message: "",
    selectedChat: "",
    selectedStudent: null,
    showMayorModal: false,
    showClassmates: false,
    showTurnOverPopUp: false,
  };
  const { currentUser } = useAuth();
  const {
    currentStudentComplaints,
    toHigherUpComplaints,
    setClassSection,
    setCurrentStudent,
    setToHigherUp,
  } = useComplaints();
  const [state, setState] = useState(initState);
  /**Don't include in react-native */
  const router = useRouter();

  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const message = event.target.value;
    setState((prevState) => ({ ...prevState, message }));
  }
  function handleClassmateClick(studentNo: string) {
    setState((prevState) => ({
      ...prevState,
      selectedStudent: studentNo,
      chatBox: studentNo,
    }));
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

  /** Setting up user info in `currentStudent` or `currentAdviser`, and role `mayor`, `student` or `adviser` in state */
  const fetchUserInfo = useCallback(async () => {
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
      const adviserSnapshot = await getDocs(
        query(
          collectionRef("advisers"),
          and(
            where("yearLevel", "==", data.yearLevel),
            where("section", "==", data.section)
          )
        )
      );
      if (!adviserSnapshot.empty) {
        const doc = adviserSnapshot.docs[0];
        const adviserData = doc?.data() as AdviserProps;
        const id = doc?.id ?? "";
        setState((prevState) => ({
          ...prevState,
          currentAdviser: { id, ...adviserData },
        }));
      }
    } else {
      const adviserSnapshot = await getDocs(
        query(
          collectionRef("advisers"),
          where("email", "==", currentUser?.email)
        )
      );
      if (!adviserSnapshot.empty) {
        const doc = adviserSnapshot.docs[0];
        const adviserData = doc?.data() as AdviserProps;
        const id = doc?.id ?? "";
        setState((prevState) => ({
          ...prevState,
          currentAdviser: { id, ...adviserData },
          role: "adviser",
        }));
      }
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
        if (!mayorSnapshot.empty) {
          const doc = mayorSnapshot.docs[0];
          const data = doc?.data() as StudentWithClassSection;
          setState((prevState) => ({
            ...prevState,
            mayor: data,
          }));
        }
      } catch (err) {
        console.log(err, "Error in getting other chattables for student");
      }
    },
    []
  );
  /** if role is === `mayor`, recipient is set to `adviser` and if called in student follow-up set-up, studentNo should be undefined */
  const fetchClassSectionComplaints = useCallback(
    ({
      targetDocument,
    }: Pick<FetchComplaintCollectionsProps, "targetDocument">) => {
      const unsub = onSnapshot(
        query(
          collection(targetDocument, "group"),
          orderBy("timestamp", "desc"),
          limit(LIMIT)
        ),
        (snapshot) => {
          const groupComplaintsHolder: ConcernBasePropsExtended[] = [];
          const newSnapshot = snapshot.docs.reverse();
          newSnapshot.forEach((doc) => {
            const data = doc.data() as ConcernBaseProps;
            const id = doc.id;
            groupComplaintsHolder.push({ ...data, id });
          });
          setClassSection(groupComplaintsHolder);
        }
      );
      return unsub;
    },
    [setClassSection]
  );
  const fetchOtherComplaints = useCallback(
    ({
      targetDocument,
      studentNo,
      recipient,
    }: FetchComplaintCollectionsProps) => {
      const unsub = onSnapshot(
        studentNo === undefined
          ? query(
              collection(targetDocument, "individual"),
              where("recipient", "==", recipient),
              orderBy("dateCreated", "desc"),
              limit(LIMIT)
            )
          : query(
              collection(targetDocument, "individual"),
              where("studentNo", "==", studentNo),
              limit(LIMIT)
            ),
        (snapshot) => {
          const concernsHolder: ConcernPropsExtended[] = [];
          const newSnapshot = snapshot.docs.reverse();
          newSnapshot.forEach((doc) => {
            const data = doc.data() as ConcernProps;
            const id = doc.id;
            concernsHolder.push({ ...data, id });
          });
          console.log({ concernsHolder });
          setState((prevState) => ({
            ...prevState,
            targetDocument: targetDocument,
          }));
          if (studentNo === undefined) {
            return setCurrentStudent(concernsHolder);
          }
          setToHigherUp(concernsHolder);
        }
      );
      return unsub;
    },
    [setCurrentStudent, setToHigherUp]
  );
  /** Setup `targetDocument`, `complaintRecord`, and `groupComplaints` in state.*/
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
          };

          fetchClassSectionComplaints({ targetDocument });
          fetchOtherComplaints(
            state.role === "mayor"
              ? fetchComplaintProps
              : { studentNo, ...fetchComplaintProps }
          );
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [
      state.role,
      returnComplaintsQuery,
      fetchOtherComplaints,
      fetchClassSectionComplaints,
    ]
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

          return fetchOtherComplaints({
            targetDocument,
            recipient: "adviser",
            studentNo: studentNo,
          });
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [returnComplaintsQuery, fetchOtherComplaints]
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
            selectedChat: document.id,
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
      const selectedChat = id;
      return setState((prevState) => ({
        ...prevState,
        showMayorModal: false,
        selectedChat,
      }));
    }
    console.log("selected chat is not a string in state");
  }

  /**TODO: Optimized this together with Mayor UI */
  const renderInputMessageContainer = () => {
    const placeholder =
      state.selectedChat === "class_section"
        ? "Compose a message to send in your class section"
        : state.chatBox === undefined && state.role !== "mayor"
        ? "Compose a new complaint"
        : "Compose a message";

    const complaintRecord =
      currentStudentComplaints?.filter(
        (props) => props.id === state.selectedChat
      ) ?? [];
    const higherUpComplaintRecord =
      toHigherUpComplaints?.filter(
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
  const renderClassSectionButton = () => {
    const classSectionName = "class_section";
    return (
      <ChatHeadButton
        name={classSectionName.replace(/_/g, " ")}
        onClick={() => {
          setState((prevState) => ({
            ...prevState,
            chatBox: classSectionName,
            selectedChat: classSectionName,
            message: initState.message,
            showClassmates: false,
            showMayorModal: false,
          }));
        }}
        condition={state.chatBox === classSectionName}
      />
    );
  };

  /** User initial Set-up */
  useEffect(() => {
    return void fetchUserInfo();
  }, [fetchUserInfo]);
  /** Adviser follow-up Set-up */
  useEffect(() => {
    const yearLevel = state.currentAdviser?.yearLevel;
    const section = state.currentAdviser?.section;
    if (
      state.role !== "student" &&
      yearLevel !== undefined &&
      section !== undefined
    ) {
      void fetchClassMatesInfo({ yearLevel, section });
    }
  }, [
    state.role,
    state.currentAdviser?.section,
    state.currentAdviser?.yearLevel,
    fetchClassMatesInfo,
  ]);
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
  console.log(currentStudentComplaints);
  return (
    <>
      {state.role === "adviser" ? (
        <RenderAdviserUI
          students={state.classMates}
          adviser={state.currentAdviser}
        />
      ) : (
        <section className="h-full">
          {state.role === "mayor" ? (
            <>
              <RenderStudentUI
                chatBox={state.chatBox}
                recipientArray={[
                  ...new Set(
                    toHigherUpComplaints
                      .map((props) => props.recipient)
                      .filter((props) => props !== "mayor")
                  ),
                ]}
                selectedChat={state.selectedChat}
                handleNewConcern={handleNewConcern}
                role={state.role}
                data={toHigherUpComplaints
                  .filter((props) => state.chatBox === props.recipient)
                  .sort((a, b) => b.dateCreated - a.dateCreated)}
                condition={state.showMayorModal}
                setId={handleSelectComplaintId}
                closingCondition={() =>
                  setState((prevState) => ({
                    ...prevState,
                    selectedChat: "",
                    showMayorModal: false,
                  }))
                }
                chatHeadOnClick={(selectedChat) => {
                  setState((prevState) => ({
                    ...prevState,
                    showClassmates: false,
                    showMayorModal: true,
                    chatBox: selectedChat,
                    selectedStudent: null,
                  }));
                }}
              >
                <ChatHeadButton
                  name="My Classmates"
                  onClick={() => {
                    setState((prevState) => ({
                      ...prevState,
                      showClassmates: true,
                      chatBox: "My Classmates",
                      showMayorModal: false,
                    }));
                  }}
                  condition={
                    (currentStudentComplaints?.filter(
                      (props) => state.selectedChat === props.id
                    ) !== undefined &&
                      currentStudentComplaints?.filter(
                        (props) => state.selectedChat === props.id
                      ).length > 0) ||
                    state.chatBox === "My Classmates"
                  }
                />
                {renderClassSectionButton()}
              </RenderStudentUI>
              <div
                className={`${
                  state.showClassmates ? "flex" : "hidden"
                } mx-auto w-full gap-2 overflow-x-auto bg-secondary p-2`}
              >
                {state.classMates
                  ?.filter(
                    (props) => props.email !== state.currentStudent?.email
                  )
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
                            <p className="font-bold text-primary">
                              {studentNo}
                            </p>
                          </div>
                        </ProfilePictureContainer>
                      </button>
                    );
                  })}
              </div>
              <ComplainBoxRenderer
                role={state.role}
                chatBox={state.chatBox}
                data={currentStudentComplaints
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
                  setState((prevState) => ({
                    ...prevState,
                    selectedStudent: null,
                    showClassmates: false,
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
              chatBox={state.chatBox}
              recipientArray={[
                ...new Set(
                  toHigherUpComplaints.map((props) => props.recipient)
                ),
              ]}
              selectedChat={state.selectedChat}
              handleNewConcern={handleNewConcern}
              role={state.role}
              data={toHigherUpComplaints
                .filter((props) => props.recipient === state.chatBox)
                .sort((a, b) => b.dateCreated - a.dateCreated)}
              condition={state.showMayorModal}
              setId={handleSelectComplaintId}
              closingCondition={() =>
                setState((prevState) => ({
                  ...prevState,
                  selectedChat: "",
                  showMayorModal: false,
                }))
              }
              chatHeadOnClick={(selectedChat) => {
                setState((prevState) => ({
                  ...prevState,
                  showMayorModal: true,
                  chatBox: selectedChat,
                }));
              }}
            >
              {renderClassSectionButton()}
            </RenderStudentUI>
          )}
          <ComplaintBox
            role={state.role}
            students={state.classMates}
            selectedChat={state.selectedChat}
            chatBox={state.chatBox}
            currentStudent={state.currentStudent}
            currentAdviser={state.currentAdviser}
          />
          {state.selectedChat !== undefined &&
            state.selectedChat !== "" &&
            renderInputMessageContainer()}
        </section>
      )}
    </>
  );
};

interface RenderStudentUIProps
  extends Pick<InitStateProps, "role">,
    Omit<ComplainBoxRendererProps, "role"> {
  selectedChat: InitStateProps["selectedChat"];
  chatBox: InitStateProps["chatBox"];
  recipientArray?: string[];
  children?: ReactNode;
  chatHeadOnClick: (value: string) => void;
}
const RenderStudentUI = ({
  role,
  chatBox,
  children,
  selectedChat,
  recipientArray,
  chatHeadOnClick,
  ...rest
}: RenderStudentUIProps) => {
  // const roleWithNewConcerns = role === "mayor" ? "adviser" : "mayor";
  // const findSelectedId = rest.data?.filter(
  //   (props) => selectedChat === props.id
  // );

  return (
    <div className="bg-primary/30 p-2">
      <div className="flex w-full flex-row gap-2 overflow-x-auto">
        {recipientArray?.map((value) => {
          return (
            <ChatHeadButton
              key={value}
              name={value.replace(/_/g, " ")}
              condition={typeof selectedChat === "object" || chatBox === value}
              onClick={() => chatHeadOnClick(value)}
            />
          );
        })}
        {children}
      </div>
      <ComplainBoxRenderer role={role} chatBox={chatBox} {...rest} />
    </div>
  );
};

interface RenderAdviserUIProps {
  adviser: InitStateProps["currentAdviser"];
  students: InitStateProps["classMates"];
}
interface AdviserStateProps
  extends Pick<
    InitStateProps,
    | "targetDocument"
    | "selectedStudent"
    | "message"
    | "showTurnOverPopUp"
    | "selectedChat"
    | "chatBox"
  > {
  showStudents: boolean;
}
const RenderAdviserUI = ({ students, adviser }: RenderAdviserUIProps) => {
  const initState: AdviserStateProps = {
    message: "",
    selectedChat: "",
    chatBox: "",
    selectedStudent: null,
    showStudents: false,
    showTurnOverPopUp: false,
  };
  const [state, setState] = useState(initState);
  const { currentStudentComplaints, setClassSection, setCurrentStudent } =
    useComplaints();

  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const message = event.target.value;
    setState((prevState) => ({ ...prevState, message }));
  }
  function handleClassmateClick(studentNo: string) {
    setState((prevState) => ({
      ...prevState,
      selectedStudent: studentNo,
      chatBox: studentNo,
    }));
  }
  function handleSelectComplaintId(id: typeof state.selectedChat) {
    if (typeof id === "string") {
      return setState((prevState) => ({
        ...prevState,
        selectedChat: id,
        showMayorModal: false,
      }));
    }
    console.log("selected chat is not a string in state");
  }

  async function handleSend(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const complaint: ConcernBaseProps = {
      timestamp: new Date().getTime(),
      sender: "adviser",
      message: state.message,
    };
    if (state.targetDocument !== undefined) {
      if (state.chatBox === "class_section") {
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
          typeof state.selectedChat === "string" ? state.selectedChat : "null"
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
  const fetchClassSectionComplaints = useCallback(
    ({
      targetDocument,
    }: Pick<FetchComplaintCollectionsProps, "targetDocument">) => {
      const unsub = onSnapshot(
        query(
          collection(targetDocument, "group"),
          orderBy("timestamp", "desc"),
          limit(LIMIT)
        ),
        (snapshot) => {
          const groupComplaintsHolder: ConcernBasePropsExtended[] = [];
          const newSnapshot = snapshot.docs.reverse();
          newSnapshot.forEach((doc) => {
            const data = doc.data() as ConcernBaseProps;
            const id = doc.id;
            groupComplaintsHolder.push({ ...data, id });
          });
          setClassSection(groupComplaintsHolder);
        }
      );
      return unsub;
    },
    [setClassSection]
  );
  const fetchOtherComplaints = useCallback(
    ({
      targetDocument,
      recipient,
    }: Omit<FetchComplaintCollectionsProps, "studentNo">) => {
      const unsub = onSnapshot(
        query(
          collection(targetDocument, "individual"),
          where("recipient", "==", recipient),
          orderBy("dateCreated", "desc"),
          limit(LIMIT)
        ),
        (snapshot) => {
          const concernsHolder: ConcernPropsExtended[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as ConcernProps;
            const id = doc.id;
            concernsHolder.push({ ...data, id });
          });
          setState((prevState) => ({
            ...prevState,
            targetDocument: targetDocument,
          }));
          setCurrentStudent(concernsHolder);
        }
      );
      return unsub;
    },
    [setCurrentStudent]
  );
  const fetchStudentConcerns = useCallback(
    async ({ yearLevel, section }: YearLevelSectionProps) => {
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

          fetchClassSectionComplaints({ targetDocument });
          fetchOtherComplaints({ targetDocument, recipient: "adviser" });
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [returnComplaintsQuery, fetchClassSectionComplaints, fetchOtherComplaints]
  );

  const renderInputMessageContainer = () => {
    const placeholder =
      state.chatBox === "class_section"
        ? "Compose a message to send in your class section"
        : "Compose a message";
    return (
      <div
        className={`${
          (typeof state.selectedChat === "string" &&
            state.selectedChat !== "") ||
          state.chatBox === "class_section"
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

  useEffect(() => {
    const section = adviser?.section;
    const yearLevel = adviser?.yearLevel;
    if (section !== undefined && yearLevel !== undefined)
      return void fetchStudentConcerns({ section, yearLevel });
  }, [adviser?.section, adviser?.yearLevel, fetchStudentConcerns]);

  return (
    <div>
      <div className="bg-primary/20 p-2">
        <div className="flex w-full flex-row gap-2 overflow-x-auto">
          <ChatHeadButton
            name="students"
            condition={state.chatBox === "students"}
            onClick={() =>
              setState((prevState) => ({
                ...prevState,
                showStudents: true,
                chatBox: "students",
              }))
            }
          />
          <ChatHeadButton
            name="class section"
            condition={state.chatBox === "class_section"}
            onClick={() =>
              setState((prevState) => ({
                ...prevState,
                chatBox: "class_section",
              }))
            }
          />
        </div>
      </div>
      <div
        className={`${
          state.showStudents ? "flex" : "hidden"
        } mx-auto w-full gap-2 overflow-x-auto bg-secondary p-2`}
      >
        {students?.map(({ studentNo, name, src }) => {
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
        role="adviser"
        chatBox={state.chatBox}
        data={currentStudentComplaints
          ?.filter((props) => props.studentNo === state.selectedStudent)
          ?.sort((a, b) => b.dateCreated - a.dateCreated)}
        heading={`${
          students
            ?.filter((props) => state.selectedStudent === props.studentNo)[0]
            ?.name.split(",")[0]
        }'s Complaint/Concern(s):`}
        condition={state.selectedStudent !== null}
        setId={handleSelectComplaintId}
        setIdExtended={() => {
          setState((prevState) => ({
            ...prevState,
            selectedStudent: null,
            showStudents: false,
          }));
        }}
        closingCondition={() =>
          setState((prevState) => ({
            ...prevState,
            selectedStudent: null,
          }))
        }
      />
      <ComplaintBox
        role="adviser"
        chatBox={state.chatBox}
        currentAdviser={adviser}
        selectedChat={state.selectedChat}
        students={students}
      />
      {renderInputMessageContainer()}
    </div>
  );
};

interface ComplainBoxRendererProps {
  role: InitStateProps["role"];
  chatBox: InitStateProps["chatBox"];
  data: ConcernPropsExtended[] | undefined;
  heading?: string;
  condition: boolean;
  setId: (id: string | Omit<ConcernProps, "messages">) => void;
  setIdExtended?: () => void;
  closingCondition: () => void;
  handleNewConcern?: () => void;
}
const ComplainBoxRenderer = ({
  role,
  data,
  heading,
  chatBox,
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
      {handleNewConcern !== undefined &&
        (role === "mayor" ? chatBox === "adviser" : chatBox === "mayor") && (
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
interface TurnOverModalProps {
  closingModal: () => void;
  handleTurnOverMessage: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  turnOverMessage: string;
  handleTurnOver: () => void;
}
const TurnOverModal = ({
  closingModal,
  turnOverMessage,
  handleTurnOverMessage,
  handleTurnOver,
}: TurnOverModalProps) => {
  return (
    <div className="fixed inset-0 z-20 bg-blue-400">
      <button
        className="absolute right-2 top-2 rounded-full bg-red-500 px-2"
        onClick={closingModal}
      >
        <p className="text-white">x</p>
      </button>
      <textarea
        className="p-2"
        placeholder="Compose a turn-over message to send to your adviser"
        value={turnOverMessage}
        onChange={(e) => handleTurnOverMessage(e)}
      />
      <button
        disabled={turnOverMessage.trim() === ""}
        className={`${
          turnOverMessage.trim() === ""
            ? "bg-slate-200 text-slate-300"
            : "bg-green text-paper"
        } rounded-lg p-2 capitalize duration-300 ease-in-out`}
        onClick={handleTurnOver}
      >
        send
      </button>
    </div>
  );
};

interface RenderTurnOverStatusProps {
  role?: "mayor" | "student" | "adviser";
  status?: "turn-over" | "resolved";
  turnOvers?: number;
}
const RenderTurnOverStatus = ({
  role,
  status,
  turnOvers,
}: RenderTurnOverStatusProps) => {
  const turnOverModified = (role === "mayor" ? 1 : 0) + (turnOvers ?? -1);

  switch (turnOverModified) {
    case undefined:
      return (
        <>
          {status === "resolved" ? "Resolved by Mayor" : "Turn-Over to Mayor"}
        </>
      );
    case 1:
      return (
        <>
          {status === "resolved"
            ? "Resolved by Adviser"
            : "Turn-Over to Adviser"}
        </>
      );
    case 2:
      return (
        <>
          {status === "resolved"
            ? "Resolved by Program Chair"
            : "Turn-Over to Program Chair"}
        </>
      );
    case 3:
      return (
        <>
          {status === "resolved"
            ? "Resolved by Board Member"
            : "Turn-Over to Board Member"}
        </>
      );
    default:
      return <>{status}</>;
  }
};

interface ChatHeadButtonProps extends HTMLAttributes<HTMLButtonElement> {
  name: string;
  disabled?: boolean;
  condition: boolean;
  replaceTrueButtonStyle?: string;
  replaceFalseButtonStyle?: string;
  replaceButtonBaseStyle?: string;
  replaceTrueTextStyle?: string;
  replaceFalseTextStyle?: string;
  replaceTextBaseStyle?: string;
}
const ChatHeadButton = ({
  name,
  condition,
  replaceTrueButtonStyle,
  replaceFalseButtonStyle,
  replaceButtonBaseStyle,
  replaceTrueTextStyle,
  replaceFalseTextStyle,
  replaceTextBaseStyle,
  ...rest
}: ChatHeadButtonProps) => {
  const buttonBaseStyle = "rounded-xl p-2 capitalize duration-300 ease-in-out";
  const trueButtonBaseStyle = "bg-secondary";
  const falseButtonBaseStyle = "bg-primary";
  const textBaseStyle = "text-white";
  const trueTextBaseStyle = "";
  const falseTextBaseStyle = "";

  const trueButtonStyle = replaceTrueButtonStyle ?? trueButtonBaseStyle;
  const falseButtonStyle = replaceFalseButtonStyle ?? falseButtonBaseStyle;
  const getBaseButtonStyle = replaceButtonBaseStyle ?? buttonBaseStyle;
  const conditionalButtonStyle = condition ? trueButtonStyle : falseButtonStyle;

  const trueTextStyle = replaceTrueTextStyle ?? trueTextBaseStyle;
  const falseTextStyle = replaceFalseTextStyle ?? falseTextBaseStyle;
  const getBaseTextStyle = replaceTextBaseStyle ?? textBaseStyle;
  const conditionalTextStyle = condition ? trueTextStyle : falseTextStyle;

  return (
    <button
      {...rest}
      className={`${getBaseButtonStyle} ${conditionalButtonStyle}`}
    >
      <p className={`${getBaseTextStyle} ${conditionalTextStyle}`}>{name}</p>
    </button>
  );
};

interface ComplaintBoxProps
  extends Pick<
    InitStateProps,
    "currentAdviser" | "chatBox" | "currentStudent"
  > {
  role: InitStateProps["role"];
  students: InitStateProps["classMates"];
  selectedChat: InitStateProps["selectedChat"];
}
const ComplaintBox = ({
  role,
  students,
  selectedChat,
  currentStudent,
  currentAdviser,
  chatBox,
}: ComplaintBoxProps) => {
  const {
    currentStudentComplaints,
    toHigherUpComplaints,
    classSectionComplaints,
  } = useComplaints();
  const [state, setState] = useState({
    turnOverMessage: "",
    turnOverModal: false,
  });

  const currentStudentRoot = currentStudentComplaints.filter(
    (props) => chatBox === props.studentNo
  );
  const filterToHigherUps = toHigherUpComplaints.filter(
    (props) => selectedChat === props.id
  );
  const filterCurrentStudent = currentStudentRoot.filter(
    (props) => selectedChat === props.id
  );

  const renderThisArray =
    chatBox === "class_section"
      ? classSectionComplaints
      : filterToHigherUps.length > 0
      ? filterToHigherUps[0]?.messages
      : filterCurrentStudent[0]?.messages;

  const targetArray = filterToHigherUps[0] ?? filterCurrentStudent[0];

  function handleTurnOverMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const turnOverMessage = event.target.value;
    setState((prevState) => ({ ...prevState, turnOverMessage }));
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

  async function actionButton(type: "resolved" | "turn-over") {
    try {
      if (typeof selectedChat === "string") {
        const reference = await returnComplaintsQuery({
          yearLevel: currentAdviser?.yearLevel ?? "null",
          section: currentAdviser?.section,
        });
        if (reference !== undefined) {
          const individualColRef = collection(
            doc(db, "complaints", reference.queryId),
            "individual"
          );
          const targetDoc = doc(individualColRef, selectedChat);
          if (type === "resolved") {
            await updateDoc(targetDoc, { status: type });
          } else if (type === "turn-over") {
            await updateDoc(targetDoc, {
              status: type,
              turnOvers: increment(1),
            });
            await addDoc(individualColRef, {
              dateCreated: new Date().getTime(),
              referenceId: selectedChat,
              messages: [
                {
                  sender: "adviser",
                  message: state.turnOverMessage,
                  timestamp: new Date().getTime(),
                },
              ],
              recipient: "program_chair",
              status: "processing",
              studentNo:
                currentStudentComplaints?.filter(
                  (props) => selectedChat === props.id
                )[0]?.studentNo ?? "null",
            });
          }
        }
      }
    } catch (err) {
      console.log(err, "Action Button");
    }
  }

  const renderHero = () => {
    const name = students?.filter(
      (props) => props.studentNo === targetArray?.studentNo
    )[0]?.name;

    return (
      <div className="bg-primary/20 p-2 text-center">
        <p className="text-xl font-bold">
          {chatBox === "adviser"
            ? "Adviser"
            : chatBox === "program_chair"
            ? "Program Chair"
            : chatBox === "board_member"
            ? "Board Member"
            : chatBox === "mayor"
            ? "Mayor"
            : name
            ? name
            : ""}
        </p>
        {(typeof selectedChat === "string" && chatBox !== "class_section") || (
          <>
            <p className="font-semibold text-primary">
              {`Concern Id: ${
                typeof selectedChat === "string" ? selectedChat : ""
              }`}
            </p>
            <p className="flex items-center justify-center gap-2">
              Status:
              <span
                className={`${
                  targetArray?.status === "processing"
                    ? "text-yellow-500"
                    : targetArray?.status === "resolved"
                    ? "text-green-500"
                    : "text-red-500"
                } font-bold capitalize`}
              >
                {targetArray?.status === "processing"
                  ? "ongoing"
                  : targetArray?.status && (
                      <RenderTurnOverStatus
                        role={role}
                        status={targetArray?.status}
                        turnOvers={targetArray?.turnOvers}
                      />
                    )}
              </span>
            </p>
          </>
        )}
        {(targetArray?.status === "processing" &&
          role !== "student" &&
          targetArray?.recipient === "mayor") ||
          (role === "adviser" &&
            chatBox !== "class_section" &&
            renderActionButtons())}
      </div>
    );
  };
  const renderActionButtons = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          className="rounded-lg bg-green-500 p-2 capitalize text-paper"
          onClick={() => void actionButton("resolved")}
        >
          resolve
        </button>
        <button
          className="rounded-lg bg-yellow-500 p-2 capitalize text-paper"
          onClick={() =>
            setState((prevState) => ({ ...prevState, turnOverModal: true }))
          }
        >
          turn-over
        </button>
        {state.turnOverModal && (
          <TurnOverModal
            closingModal={() =>
              setState((prevState) => ({ ...prevState, turnOverModal: true }))
            }
            turnOverMessage={state.turnOverMessage}
            handleTurnOverMessage={handleTurnOverMessage}
            handleTurnOver={() => {
              setState((prevState) => ({
                ...prevState,
                turnOverMessage: "",
                turnOverModal: false,
              }));
              void actionButton("turn-over");
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {selectedChat !== "" && renderHero()}
      <div className="flex h-[60vh] flex-col gap-2 overflow-y-auto bg-primary/10 p-2">
        {renderThisArray?.map(({ message, timestamp, sender }, index) => {
          const newTimestamp = new Date();
          newTimestamp.setTime(timestamp);
          const targetStudent = students?.filter(
            (props) => sender === props.studentNo
          )[0];

          return (
            <ProfilePictureContainer
              key={index}
              src={
                sender === "adviser"
                  ? currentAdviser?.src ?? ""
                  : targetStudent?.src ?? ""
              }
              renderCondition={sender === currentStudent?.studentNo}
            >
              <div className="relative">
                <div>
                  <p className="font-bold">
                    {sender === "adviser"
                      ? currentAdviser?.name ??
                        currentAdviser?.email ??
                        "not_faculty"
                      : targetStudent?.name ?? "not_student"}
                  </p>
                  <p className="font-bold text-primary">
                    {sender === "adviser"
                      ? `${currentAdviser?.yearLevel.substring(
                          0,
                          1
                        )}${currentAdviser?.section?.toUpperCase()} Adviser`
                      : sender}
                  </p>
                  <p>{message}</p>
                  <p className="text-xs font-thin">
                    {newTimestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </ProfilePictureContainer>
          );
        })}
      </div>
    </>
  );
};

export default Complaints;
