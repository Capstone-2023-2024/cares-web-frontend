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
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  useCallback,
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
import type {
  ReadConcernBaseProps,
  ReadConcernProps,
  WriteConcernBaseProps,
  WriteConcernProps,
} from "~/types/complaints";
import { collectionRef } from "~/types/firebase";
import type { AdviserProps } from "~/types/permissions";
import type { StudentWithClassSection } from "~/types/student";
import { db } from "~/utils/firebase";
import ComplaintsProvider, { useComplaints } from "./ComplaintsProvider";
import ContentManipulationProvider, {
  useContentManipulation,
  type ContentManipulationProviderStateProps,
} from "./ContentManipulationProvider";
import ModalProvider, { useModal } from "./ModalProvider";
import type {
  UniversalProviderStateProps,
  YearLevelSectionProps,
} from "./UniversalProvider";
import UniversalProvider, { useUniversal } from "./UniversalProvider";
import { recipientEscalation } from "@cares/utils/validation";

const LIMIT = 15;
const Complaints = () => {
  return (
    <ModalProvider>
      <ContentManipulationProvider>
        <UniversalProvider>
          <ComplaintsWrapper />
        </UniversalProvider>
      </ContentManipulationProvider>
    </ModalProvider>
  );
};
/** User's initial Set-up */
const ComplaintsWrapper = () => {
  const { currentUser } = useAuth();
  const { setRole, setCurrentStudentInfo, setAdviserInfo } = useUniversal();

  /** Setting up setRole, setCurrentStudentInfo, and setAdviserInfo */
  const fetchUserInfo = useCallback(async () => {
    if (typeof currentUser?.email === "string") {
      const studentSnapshot = await getDocs(
        query(
          collectionRef("student"),
          where("email", "==", currentUser.email),
        ),
      );
      const mayorSnapshot = await getDocs(
        query(collectionRef("mayor"), where("email", "==", currentUser.email)),
      );

      if (!studentSnapshot.empty) {
        const doc = studentSnapshot.docs[0];
        const data = doc?.data() as StudentWithClassSection;
        setRole("student");
        setCurrentStudentInfo(data);
        const adviserSnapshot = await getDocs(
          query(
            collectionRef("advisers"),
            and(
              where("yearLevel", "==", data.yearLevel),
              where("section", "==", data.section),
            ),
          ),
        );
        if (!adviserSnapshot.empty) {
          const doc = adviserSnapshot.docs[0];
          const adviserData = doc?.data() as AdviserProps;
          const id = doc?.id ?? "null";
          setAdviserInfo(adviserData, id);
        }
      } else {
        const adviserSnapshot = await getDocs(
          query(
            collectionRef("advisers"),
            where("email", "==", currentUser.email),
          ),
        );
        if (!adviserSnapshot.empty) {
          const doc = adviserSnapshot.docs[0];
          const adviserData = doc?.data() as AdviserProps;
          const id = doc?.id ?? "";
          setAdviserInfo(adviserData, id);
          setRole("adviser");
        }
      }
      if (!mayorSnapshot.empty) {
        setRole("mayor");
      }
    }
  }, [currentUser?.email, setAdviserInfo, setCurrentStudentInfo, setRole]);

  useEffect(() => {
    return void fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <Main>
      <ComplaintsProvider>
        <MainPage />
      </ComplaintsProvider>
    </Main>
  );
};

interface MayorSetUpProps extends YearLevelSectionProps {
  studentNo: string;
}
interface FetchComplaintCollectionsProps {
  studentNo?: string;
  recipient: UniversalProviderStateProps["role"];
}
interface InitStateProps {
  message: string;
  newConcernDetails?: Omit<WriteConcernProps, "messages">;
}
const MainPage = () => {
  const initState: InitStateProps = {
    message: "",
  };
  const [state, setState] = useState(initState);
  const { currentUser } = useAuth();
  const {
    currentStudentComplaints,
    otherComplaints,
    setClassSectionComplaints,
    setCurrentStudentComplaints,
    setOtherComplaints,
  } = useComplaints();
  const {
    selectedChatHead,
    selectedChatId,
    selectedStudent,
    currentYearSectionComplaintDocId,
    setCurrentYearSectionComplaintDocId,
    setSelectedChatHead,
    setSelectedChatId,
    setSelectedStudent,
  } = useContentManipulation();
  const {
    role,
    studentsInfo,
    adviserInfo,
    currentStudentInfo,
    setStudentsInfo,
    setMayorInfo,
  } = useUniversal();
  const { showMayorModal, showStudents, setShowMayorModal, setShowStudents } =
    useModal();

  /** TODO: Don't include in react-native */
  const router = useRouter();
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

  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const message = event.target.value;
    setState((prevState) => ({ ...prevState, message }));
  }
  function handleClassmateClick(studentNo: string) {
    setSelectedStudent(studentNo);
    setSelectedChatHead("students");
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
          where("academicYear", "==", formatYearStringify),
        ),
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
    [],
  );

  /**TODO: Store classmate info into Local Storage */
  const fetchClassStudents = useCallback(
    ({ yearLevel, section }: YearLevelSectionProps) => {
      const studentQuery = query(
        collectionRef("student"),
        and(
          where("yearLevel", "==", yearLevel),
          where("section", "==", section),
        ),
      );
      return onSnapshot(studentQuery, (snapshot) => {
        const studentsHolder: StudentWithClassSection[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as StudentWithClassSection;
          studentsHolder.push(data);
        });
        setStudentsInfo(studentsHolder);
      });
    },
    [setStudentsInfo],
  );
  const getChattablesForStudent = useCallback(
    async ({ yearLevel, section }: YearLevelSectionProps) => {
      try {
        const mayorSnapshot = await getDocs(
          query(
            collectionRef("mayor"),
            and(
              where("yearLevel", "==", yearLevel),
              where("section", "==", section),
            ),
          ),
        );
        if (!mayorSnapshot.empty) {
          const doc = mayorSnapshot.docs[0];
          const data = doc?.data() as StudentWithClassSection;
          setMayorInfo(data);
        }
      } catch (err) {
        console.log(err, "Error in getting other chattables for student");
      }
    },
    [setMayorInfo],
  );
  /** if role is === `mayor`, recipient is set to `adviser` and if called in student follow-up set-up, studentNo should be undefined */
  const fetchClassSectionComplaints = useCallback(() => {
    const unsub =
      currentYearSectionComplaintDocId !== null &&
      onSnapshot(
        query(
          collection(
            doc(collection(db, "complaints"), currentYearSectionComplaintDocId),
            "group",
          ),
          orderBy("timestamp", "desc"),
          limit(LIMIT),
        ),
        (snapshot) => {
          const groupComplaintsHolder: ReadConcernBaseProps[] = [];
          const newSnapshot = snapshot.docs.reverse();
          newSnapshot.forEach((doc) => {
            const data = doc.data() as WriteConcernBaseProps;
            const id = doc.id;
            groupComplaintsHolder.push({ ...data, id });
          });
          setClassSectionComplaints(groupComplaintsHolder);
        },
      );
    return unsub ? unsub : () => null;
  }, [setClassSectionComplaints, currentYearSectionComplaintDocId]);
  /** If studentNo is undefined, concerns will be redirected to currentStudentComplaints */
  const fetchOtherComplaints = useCallback(
    ({ studentNo, recipient }: FetchComplaintCollectionsProps) => {
      const unsub =
        currentYearSectionComplaintDocId !== null &&
        onSnapshot(
          studentNo === undefined
            ? query(
                collection(
                  doc(
                    collection(db, "complaints"),
                    currentYearSectionComplaintDocId,
                  ),
                  "individual",
                ),
                where("recipient", "==", recipient),
                orderBy("dateCreated", "desc"),
                limit(LIMIT),
              )
            : query(
                collection(
                  doc(
                    collection(db, "complaints"),
                    currentYearSectionComplaintDocId,
                  ),
                  "individual",
                ),
                where("studentNo", "==", studentNo),
                limit(LIMIT),
              ),
          (snapshot) => {
            const concernsHolder: ReadConcernProps[] = [];
            const newSnapshot = snapshot.docs.reverse();
            newSnapshot.forEach((doc) => {
              const data = doc.data() as WriteConcernProps;
              const id = doc.id;
              concernsHolder.push({ ...data, id });
            });
            if (studentNo === undefined) {
              console.log({ concernsHolder });
              return setCurrentStudentComplaints(concernsHolder);
            }
            setOtherComplaints(concernsHolder);
          },
        );
      return unsub;
    },
    [
      setCurrentStudentComplaints,
      setOtherComplaints,
      currentYearSectionComplaintDocId,
    ],
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
          setCurrentYearSectionComplaintDocId(reference.queryId);
          const fetchComplaintProps: FetchComplaintCollectionsProps = {
            recipient: "mayor",
          };
          console.log({ complaintsFetch: fetchComplaintProps });
          fetchOtherComplaints(
            role === "mayor"
              ? fetchComplaintProps
              : { studentNo, ...fetchComplaintProps },
          );
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [
      role,
      fetchOtherComplaints,
      returnComplaintsQuery,
      setCurrentYearSectionComplaintDocId,
    ],
  );
  /** Mayor's Setup for Student concerns, and Mayor's concern for Adviser */
  const mayorSetup = useCallback(
    async ({ yearLevel, section, studentNo }: MayorSetUpProps) => {
      try {
        const reference = await returnComplaintsQuery({
          yearLevel,
          section,
        });

        if (reference !== undefined) {
          setCurrentYearSectionComplaintDocId(reference.queryId);
          return fetchOtherComplaints({
            recipient: "adviser",
            studentNo: studentNo,
          });
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [
      returnComplaintsQuery,
      fetchOtherComplaints,
      setCurrentYearSectionComplaintDocId,
    ],
  );
  /** Adviser's Setup for Student concerns, and Mayor's concerns */
  const adviserSetup = useCallback(
    async ({ yearLevel, section }: YearLevelSectionProps) => {
      try {
        const reference = await returnComplaintsQuery({
          yearLevel,
          section,
        });

        if (reference !== undefined) {
          setCurrentYearSectionComplaintDocId(reference.queryId);
          return fetchOtherComplaints({
            recipient: "adviser",
          });
        }
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [
      returnComplaintsQuery,
      fetchOtherComplaints,
      setCurrentYearSectionComplaintDocId,
    ],
  );
  /** TODO: Add notification. If sender is anonymous, currentStudentInfo is not loaded properly */
  async function handleSend(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const complaint: WriteConcernBaseProps = {
      timestamp: new Date().getTime(),
      sender:
        role === "adviser"
          ? currentUser?.email ?? "adviser"
          : currentStudentInfo?.studentNo ?? "anonymous",
      message: state.message,
    };
    if (currentYearSectionComplaintDocId !== null) {
      const complaintDocRef = doc(
        collection(db, "complaints"),
        currentYearSectionComplaintDocId,
      );
      if (typeof selectedChatId === "string") {
        if (
          selectedChatId === "object" &&
          typeof state.newConcernDetails === "object"
        ) {
          const data: WriteConcernProps = {
            messages: [complaint],
            ...state.newConcernDetails,
          };
          try {
            const document = await addDoc(
              collection(complaintDocRef, "individual"),
              data,
            );
            setSelectedChatHead(role === "mayor" ? "adviser" : "mayor");
            setSelectedChatId(document.id);
            return setState((prevState) => ({
              ...prevState,
              message: initState.message,
              newConcernDetails: undefined,
            }));
          } catch (err) {
            console.log(
              err,
              "Sending message through complaints => individual",
            );
          }
        } else if (selectedChatId === "class_section") {
          await addDoc(collection(complaintDocRef, "group"), complaint);
          console.log("message sent!");
          return setState((prevState) => ({
            ...prevState,
            message: initState.message,
          }));
        }
        /** ELSE: This is for student forwarding messages to the existing complaint */
        const docRef = doc(
          collection(complaintDocRef, "individual"),
          selectedChatId,
        );
        try {
          await updateDoc(docRef, {
            messages: arrayUnion(complaint),
          });
          console.log("message sent!");
          return setState((prevState) => ({
            ...prevState,
            message: initState.message,
          }));
        } catch (err) {
          return console.log(
            "Failed in forwarding messages to the existing complaint",
          );
        }
      }
      return console.log("selectedChatId is null");
    }
    console.log("Individual Complaints Collection in state is undefined");
  }
  /** If role is `mayor` it is directed to `adviser`, else if role is `student` it is directed to `mayor` */
  function handleNewConcern() {
    if (currentStudentInfo?.studentNo !== undefined) {
      const recipient = role === "mayor" ? "adviser" : "mayor";
      const newConcernDetails: Omit<WriteConcernProps, "messages"> = {
        status: "processing",
        recipient,
        studentNo: currentStudentInfo.studentNo,
        dateCreated: new Date().getTime(),
      };
      setSelectedChatHead(recipient);
      setSelectedChatId("object");
      // setShowMayorModal(false);
      return setState((prevState) => ({
        ...prevState,
        newConcernDetails,
      }));
    }
    alert("studentNo is undefined");
  }

  /**TODO: Optimized this together with Mayor UI */
  const renderInputMessageContainer = () => {
    const placeholder =
      selectedChatId === "class_section"
        ? "Compose a message to send in your class section"
        : selectedChatHead === null && role !== "mayor"
          ? "Compose a new complaint"
          : "Compose a message";

    const complaintRecord = currentStudentComplaints?.filter(
      (props) => props.id === selectedChatId,
    );
    const higherUpComplaintRecord = otherComplaints?.filter(
      (props) => props.id === selectedChatId,
    );
    const renderCondition =
      (complaintRecord.length > 0 &&
        complaintRecord[0]?.status === "processing") ||
      (higherUpComplaintRecord.length > 0 &&
        higherUpComplaintRecord[0]?.status === "processing");

    return (
      <div
        className={`${
          renderCondition ||
          selectedChatId === "object" ||
          selectedChatHead === "class_section"
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
          setSelectedChatHead(classSectionName);
          setSelectedChatId(classSectionName);
          setSelectedStudent(null);
          setShowStudents(false);
          setShowMayorModal(false);
          setState((prevState) => ({
            ...prevState,
            message: initState.message,
          }));
        }}
        condition={selectedChatHead === classSectionName}
      />
    );
  };

  /** Set-up for whole class section with same `yearLevel` and `section`*/
  useEffect(() => {
    const yearLevel = adviserInfo?.yearLevel ?? currentStudentInfo?.yearLevel;
    const section = adviserInfo?.section ?? currentStudentInfo?.section;
    if (yearLevel !== undefined && section !== undefined) {
      fetchClassStudents({ yearLevel, section });
    }
    return fetchClassSectionComplaints();
  }, [
    fetchClassSectionComplaints,
    fetchClassStudents,
    currentYearSectionComplaintDocId,
    adviserInfo?.section,
    adviserInfo?.yearLevel,
    currentStudentInfo?.section,
    currentStudentInfo?.yearLevel,
  ]);
  /** Student follow-up Set-up */
  useEffect(() => {
    const yearLevel = currentStudentInfo?.yearLevel;
    const section = currentStudentInfo?.section;
    const studentNo = currentStudentInfo?.studentNo;
    if (
      yearLevel !== undefined &&
      section !== undefined &&
      studentNo !== undefined
    ) {
      console.log("student");
      void getChattablesForStudent({ yearLevel, section });
      void fetchStudentConcerns({ yearLevel, section, studentNo });
    }
  }, [
    currentStudentInfo?.section,
    currentStudentInfo?.studentNo,
    currentStudentInfo?.yearLevel,
    getChattablesForStudent,
    fetchStudentConcerns,
  ]);
  /** Mayor Set-up for fetching complaints */
  useEffect(() => {
    const yearLevel = currentStudentInfo?.yearLevel;
    const section = currentStudentInfo?.section;
    const studentNo = currentStudentInfo?.studentNo;
    if (
      role === "mayor" &&
      yearLevel !== undefined &&
      section !== undefined &&
      studentNo !== undefined
    ) {
      console.log("mayor");
      void mayorSetup({ yearLevel, section, studentNo });
    }
  }, [
    role,
    currentStudentInfo?.studentNo,
    currentStudentInfo?.yearLevel,
    currentStudentInfo?.section,
    mayorSetup,
  ]);
  /** Adviser set-up for fetching complaints */
  useEffect(() => {
    const yearLevel = adviserInfo?.yearLevel;
    const section = adviserInfo?.section;
    if (
      role === "adviser" &&
      yearLevel !== undefined &&
      section !== undefined
    ) {
      console.log("adviser");
      void adviserSetup({ yearLevel, section });
    }
  }, [role, adviserInfo?.yearLevel, adviserInfo?.section, adviserSetup]);

  if (role === undefined) {
    return <Loading />;
  }

  return (
    <>
      <section className="h-full">
        {role !== "student" ? (
          <>
            <RenderChatHeads
              handleNewConcern={handleNewConcern}
              data={otherComplaints
                .filter((props) => selectedChatHead === props.recipient)
                .sort((a, b) => b.dateCreated - a.dateCreated)}
              condition={showMayorModal}
              closingCondition={() => {
                setSelectedChatId(null);
                setShowMayorModal(false);
              }}
              chatHeadOnClick={(selectedChatHead) => {
                selectedChatHead !== "students" && setSelectedStudent(null);
                setSelectedChatId(null);
                setSelectedChatHead(selectedChatHead);
                setShowStudents(false);
                setShowMayorModal(true);
              }}
            >
              <ChatHeadButton
                name={role === "mayor" ? "My Classmates" : "Students"}
                onClick={() => {
                  setSelectedChatHead("students");
                  setSelectedChatId(null);
                  setShowStudents(true);
                  setShowMayorModal(false);
                }}
                condition={selectedChatHead === "students"}
              />
              {renderClassSectionButton()}
            </RenderChatHeads>
            <div
              className={`${
                showStudents ? "flex" : "hidden"
              } mx-auto w-full gap-2 overflow-x-auto bg-secondary p-2`}
            >
              {studentsInfo
                ?.filter((props) => props.email !== currentStudentInfo?.email)
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
            <ComplaintBoxRenderer
              data={currentStudentComplaints
                ?.filter((props) => props.studentNo === selectedStudent)
                ?.sort((a, b) => b.dateCreated - a.dateCreated)}
              heading={`${studentsInfo
                ?.filter((props) => selectedStudent === props.studentNo)[0]
                ?.name.split(",")[0]}'s Complaint/Concern(s):`}
              condition={selectedStudent !== null}
              setIdExtended={() => {
                selectedChatHead !== "students" && setSelectedStudent(null);
                setShowStudents(false);
              }}
              closingCondition={() => {
                selectedChatHead !== "students" && setSelectedStudent(null);
              }}
            />
          </>
        ) : (
          <RenderChatHeads
            handleNewConcern={handleNewConcern}
            data={otherComplaints
              .filter((props) => props.recipient === selectedChatHead)
              .sort((a, b) => b.dateCreated - a.dateCreated)}
            condition={showMayorModal}
            closingCondition={() => {
              setSelectedChatId(null);
              setShowMayorModal(false);
            }}
            chatHeadOnClick={(selectedChatHead) => {
              setSelectedChatHead(selectedChatHead);
              setSelectedChatId(null);
              setShowMayorModal(true);
            }}
          >
            {renderClassSectionButton()}
          </RenderChatHeads>
        )}
        <ComplaintBox />
        {renderInputMessageContainer()}
      </section>
    </>
  );
};

interface RenderChatHeadsProps extends ComplaintBoxRendererProps {
  children?: ReactNode;
  chatHeadOnClick: (
    value: ContentManipulationProviderStateProps["selectedChatHead"],
  ) => void;
}
const RenderChatHeads = ({
  children,
  chatHeadOnClick,
  ...rest
}: RenderChatHeadsProps) => {
  const { role } = useUniversal();
  const { otherComplaints } = useComplaints();
  const { selectedChatId, selectedChatHead } = useContentManipulation();
  const recipients = otherComplaints.map((props) => props.recipient);
  console.log(otherComplaints);
  if (role === "student") {
    recipients.push("mayor");
  } else if (role === "mayor") {
    const mayorIndex = recipients.indexOf(role);
    if (mayorIndex > -1) {
      recipients.splice(mayorIndex);
    }
    recipients.push("adviser");
  }

  return (
    <div className="bg-primary/30 p-2">
      <div className="flex w-full flex-row gap-2 overflow-x-auto">
        {[...new Set(recipients)].map((value) => {
          return (
            <ChatHeadButton
              key={value}
              name={value.replace(/_/g, " ")}
              condition={
                (typeof selectedChatId === "string" &&
                  selectedChatId === "object") ||
                selectedChatHead === value
              }
              onClick={() =>
                chatHeadOnClick(
                  value as ContentManipulationProviderStateProps["selectedChatHead"],
                )
              }
            />
          );
        })}
        {children}
      </div>
      <ComplaintBoxRenderer {...rest} />
    </div>
  );
};

interface ComplaintBoxRendererProps {
  data: ReadConcernProps[] | undefined;
  heading?: string;
  condition: boolean;
  setIdExtended?: () => void;
  closingCondition: () => void;
  handleNewConcern?: () => void;
}
const ComplaintBoxRenderer = ({
  data,
  heading,
  condition,
  setIdExtended,
  closingCondition,
  handleNewConcern,
}: ComplaintBoxRendererProps) => {
  const { role } = useUniversal();
  const { selectedChatHead, selectedChatId, setSelectedChatId } =
    useContentManipulation();

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
          {data?.map(
            ({ id, messages, dateCreated, status, turnOvers, recipient }) => {
              const date = new Date();
              const timestamp = new Date();
              const selectedMessage = messages[messages.length - 1];

              date.setTime(dateCreated);
              timestamp.setTime(selectedMessage?.timestamp ?? -28800000);
              return (
                <button
                  key={id}
                  className={`${
                    selectedChatId === id
                      ? "scale-105 bg-secondary"
                      : "scale-95 bg-primary"
                  } rounded-lg p-2 text-start shadow-sm duration-300 ease-in-out`}
                  onClick={() => {
                    setIdExtended && setIdExtended();
                    setSelectedChatId(id);
                  }}
                >
                  <p
                    className={`${
                      selectedChatId === id
                        ? "font-bold text-paper"
                        : "text-slate-400"
                    } text-sm duration-300 ease-in-out`}
                  >{`Concern Id: ${id}`}</p>
                  <p className="text-sm text-paper">
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
                      <RenderTurnOverStatus
                        recipient={recipient}
                        status={status}
                        turnOvers={turnOvers}
                      />
                    </span>
                  </p>
                  <p className="text-sm text-paper">{`Recent Message: ${selectedMessage?.message.substring(
                    0,
                    selectedMessage.message.length > 6
                      ? 4
                      : selectedMessage.message.length,
                  )}...`}</p>
                  <p className="text-xs font-thin text-paper">{`Date: ${date.toLocaleDateString()}`}</p>
                </button>
              );
            },
          )}
        </div>
      </>
      {handleNewConcern !== undefined &&
        (role === "mayor"
          ? selectedChatHead === "adviser"
          : selectedChatHead === "mayor") && (
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
  recipient?: WriteConcernProps["recipient"];
  status?: "turn-over" | "resolved" | "processing";
  turnOvers?: number;
}
const RenderTurnOverStatus = ({
  recipient,
  status,
  turnOvers,
}: RenderTurnOverStatusProps) => {
  const turnOverModified = (recipient === "mayor" ? 0 : 1) + (turnOvers ?? -1);

  switch (turnOverModified) {
    case undefined:
      return <>{status}</>;
    case 1:
      return (
        <>
          {status === "resolved"
            ? "Resolved by Adviser"
            : "Turned over to Adviser"}
        </>
      );
    case 2:
      return (
        <>
          {status === "resolved"
            ? "Resolved by Program Chair"
            : "Turned over to Program Chair"}
        </>
      );
    case 3:
      return (
        <>
          {status === "resolved"
            ? "Resolved by Board Member"
            : "Turned over to Board Member"}
        </>
      );
    default:
      return (
        <>{status === "processing" ? "ongoing" : `${status} by ${recipient}`}</>
      );
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

const ComplaintBox = ({}) => {
  const { currentStudentComplaints, otherComplaints, classSectionComplaints } =
    useComplaints();
  const { role, studentsInfo, adviserInfo, currentStudentInfo } =
    useUniversal();
  const { selectedChatId, selectedChatHead, selectedStudent } =
    useContentManipulation();
  const { showTurnOverModal, setShowTurnOverModal } = useModal();
  const [state, setState] = useState({
    turnOverMessage: "",
  });

  const currentStudentInfoRoot = currentStudentComplaints.filter(
    (props) => selectedStudent === props.studentNo,
  );
  const filterOtherComplaints = otherComplaints.filter(
    (props) => selectedChatId === props.id,
  );
  const filterCurrentStudent = currentStudentInfoRoot.filter(
    (props) => selectedChatId === props.id,
  );

  const renderThisArray =
    selectedChatHead === "class_section"
      ? classSectionComplaints
      : filterOtherComplaints.length > 0
        ? filterOtherComplaints[0]?.messages
        : filterCurrentStudent[0]?.messages;

  const targetArray = filterOtherComplaints[0] ?? filterCurrentStudent[0];

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
          where("academicYear", "==", formatYearStringify),
        ),
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
    [],
  );

  async function actionButton(type: "resolved" | "turn-over") {
    try {
      if (typeof selectedChatId === "string") {
        const reference = await returnComplaintsQuery({
          yearLevel:
            currentStudentInfo?.yearLevel ?? adviserInfo?.yearLevel ?? "null",
          section: currentStudentInfo?.section ?? adviserInfo?.section,
        });
        if (reference !== undefined) {
          const individualColRef = collection(
            doc(db, "complaints", reference.queryId),
            "individual",
          );
          const targetDoc = doc(individualColRef, selectedChatId);
          if (type === "resolved") {
            await updateDoc(targetDoc, { status: type });
          } else if (type === "turn-over") {
            if (role !== undefined) {
              const turnOverDetails = {
                dateCreated: new Date().getTime(),
                referenceId: selectedChatId,
                messages: [
                  {
                    sender: currentStudentInfo?.studentNo ?? role,
                    message: state.turnOverMessage,
                    timestamp: new Date().getTime(),
                  },
                ],
                recipient: recipientEscalation(role),
                status: "processing",
                studentNo:
                  currentStudentComplaints?.filter(
                    (props) => selectedChatId === props.id,
                  )[0]?.studentNo ?? "null",
              };
              await updateDoc(targetDoc, {
                status: type,
                turnOvers: increment(1),
              });
              await addDoc(individualColRef, turnOverDetails);
            }
          }
        }
      }
    } catch (err) {
      console.log(err, "Action Button");
    }
  }

  /** TODO: Add notification here */
  const renderActionButtons = () => {
    const condition =
      targetArray?.status === "processing" &&
      role === targetArray?.recipient &&
      selectedChatHead !== "class_section" &&
      selectedChatId !== "class_section";
    return (
      <div
        className={`${
          condition ? "flex" : "hidden"
        } items-center justify-center gap-2`}
      >
        <button
          className="rounded-lg bg-green-500 p-2 capitalize text-paper"
          onClick={() => void actionButton("resolved")}
        >
          resolve
        </button>
        <button
          className="rounded-lg bg-yellow-500 p-2 capitalize text-paper"
          onClick={() => setShowTurnOverModal(true)}
        >
          turn-over
        </button>
        {showTurnOverModal && (
          <TurnOverModal
            closingModal={() => setShowTurnOverModal(false)}
            turnOverMessage={state.turnOverMessage}
            handleTurnOverMessage={handleTurnOverMessage}
            handleTurnOver={() => {
              setShowTurnOverModal(false);
              setState((prevState) => ({
                ...prevState,
                turnOverMessage: "",
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
      {renderActionButtons()}
      <div className="flex h-[60vh] flex-col gap-2 overflow-y-auto bg-primary/10 p-2">
        {renderThisArray?.map(({ message, timestamp, sender }, index) => {
          const newTimestamp = new Date();
          newTimestamp.setTime(timestamp);
          console.log({ studentsInfo });
          const targetStudent = studentsInfo?.filter(
            (props) => sender === props.studentNo,
          )[0];

          return (
            <ProfilePictureContainer
              key={index}
              src={
                sender === adviserInfo?.email
                  ? adviserInfo?.src ?? ""
                  : targetStudent?.src ?? ""
              }
              renderCondition={
                role === "adviser"
                  ? sender === adviserInfo?.email
                  : sender === currentStudentInfo?.studentNo
              }
            >
              <div className="relative">
                <div>
                  <p className="font-bold">
                    {sender === adviserInfo?.email
                      ? adviserInfo?.name ??
                        adviserInfo?.email ??
                        "Deleted Faculty"
                      : targetStudent?.name ?? "Deleted User"}
                  </p>
                  <p className="font-bold text-primary">
                    {sender === adviserInfo?.email
                      ? `${adviserInfo?.yearLevel.substring(
                          0,
                          1,
                        )}${adviserInfo?.section?.toUpperCase()} Adviser`
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
