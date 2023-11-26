import type {
  ComplaintBaseProps,
  ComplaintProps,
} from "@cares/types/complaint";
import type { FirestoreDatabaseProps } from "@cares/types/document";
import type { AdviserInfoProps, StudentInfoProps } from "@cares/types/user";
import {
  addDoc,
  and,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";
import { collectionRef, db } from "~/utils/firebase";
import ComplaintsProvider, { useComplaints } from "./ComplaintsProvider";
import ContentManipulationProvider, {
  useContentManipulation,
} from "./ContentManipulationProvider";
import ModalProvider, { useModal } from "./ModalProvider";
import RenderChatHeads from "./RenderChatHeads";
import type {
  UniversalProviderStateProps,
  YearLevelSectionProps,
} from "./UniversalProvider";
import UniversalProvider, { useUniversal } from "./UniversalProvider";
import {
  ChatHeadButton,
  ComplaintBox,
  ComplaintBoxRenderer,
  RenderStudents,
} from "./components";

interface ReadComplaintBaseProps
  extends ComplaintBaseProps,
    FirestoreDatabaseProps {}
interface ReadComplaintProps extends ComplaintProps, FirestoreDatabaseProps {}

const LIMIT = 15;
const Complaints = () => {
  return (
    <UniversalProvider>
      <ModalProvider>
        <ContentManipulationProvider>
          <ComplaintsWrapper />
        </ContentManipulationProvider>
      </ModalProvider>
    </UniversalProvider>
  );
};
/** User's initial Set-up */
const ComplaintsWrapper = () => {
  const { currentUser } = useAuth();
  const {
    setRole,
    setAdviserInfo,
    setCurrentStudentInfo,
    returnComplaintsQuery,
  } = useUniversal();

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
      console.log(
        currentUser?.email,
        setAdviserInfo,
        setCurrentStudentInfo,
        returnComplaintsQuery,
        setRole,
      );

      if (!studentSnapshot.empty) {
        const doc = studentSnapshot.docs[0];
        const data = doc?.data() as StudentInfoProps;
        const { yearLevel, section } = data;
        const classSection = { yearLevel, section };
        setRole("student");
        setCurrentStudentInfo(data);
        void returnComplaintsQuery(classSection);
        const adviserSnapshot = await getDocs(
          query(
            collectionRef("adviser"),
            and(
              where("yearLevel", "==", yearLevel),
              where("section", "==", section),
            ),
          ),
        );
        if (!adviserSnapshot.empty) {
          const doc = adviserSnapshot.docs[0];
          const adviserData = doc?.data() as AdviserInfoProps;
          const id = doc?.id ?? "null";
          setAdviserInfo(adviserData, id);
        }
      } else {
        const adviserSnapshot = await getDocs(
          query(
            collectionRef("adviser"),
            where("email", "==", currentUser.email),
          ),
        );
        if (!adviserSnapshot.empty) {
          const doc = adviserSnapshot.docs[0];
          const adviserData = doc?.data() as AdviserInfoProps;
          const id = doc?.id ?? "";
          const classSection = {
            yearLevel: adviserData.yearLevel,
            section: adviserData.section,
          };
          setAdviserInfo(adviserData, id);
          setRole("adviser");
        }
      }
      if (!mayorSnapshot.empty) {
        setRole("mayor");
      }
    }
  }, [
    currentUser?.email,
    setAdviserInfo,
    setCurrentStudentInfo,
    returnComplaintsQuery,
    setRole,
  ]);

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
interface FetchComplaintCollectionsProps {
  studentNo?: string;
  recipient: UniversalProviderStateProps["role"];
}
interface InitStateProps {
  message: string;
  newConcernDetails?: Omit<ComplaintProps, "messages">;
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
    setSelectedChatHead,
    setSelectedChatId,
    setSelectedStudent,
  } = useContentManipulation();
  const { role, queryId, studentsInfo, currentStudentInfo, setMayorInfo } =
    useUniversal();
  const { showMayorModal, setShowMayorModal, setShowStudents } = useModal();

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
  /** Can be moved to useUniversal's useEffect */
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
          const data = doc?.data() as StudentInfoProps;
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
      queryId !== null &&
      onSnapshot(
        query(
          collection(doc(collection(db, "complaints"), queryId), "group"),
          orderBy("timestamp", "desc"),
          limit(LIMIT),
        ),
        (snapshot) => {
          const groupComplaintsHolder: ReadComplaintBaseProps[] = [];
          const newSnapshot = snapshot.docs.reverse();
          newSnapshot.forEach((doc) => {
            const data = doc.data() as ComplaintBaseProps;
            const id = doc.id;
            groupComplaintsHolder.push({ ...data, id });
          });
          setClassSectionComplaints(groupComplaintsHolder);
        },
      );
    return unsub ? unsub : () => null;
  }, [setClassSectionComplaints, queryId]);
  /** If studentNo is undefined, concerns will be redirected to currentStudentComplaints */
  const fetchOtherComplaints = useCallback(
    ({ studentNo, recipient }: FetchComplaintCollectionsProps) => {
      const unsub =
        queryId !== null &&
        onSnapshot(
          studentNo === undefined
            ? query(
                collection(
                  doc(collection(db, "complaints"), queryId),
                  "individual",
                ),
                where("recipient", "==", recipient),
                orderBy("dateCreated", "desc"),
                limit(LIMIT),
              )
            : query(
                collection(
                  doc(collection(db, "complaints"), queryId),
                  "individual",
                ),
                where("studentNo", "==", studentNo),
                limit(LIMIT),
              ),
          (snapshot) => {
            const concernsHolder: ReadComplaintProps[] = [];
            const newSnapshot = snapshot.docs.reverse();
            newSnapshot.forEach((doc) => {
              const data = doc.data() as ComplaintProps;
              const id = doc.id;
              concernsHolder.push({ ...data, id });
            });
            if (studentNo === undefined) {
              return setCurrentStudentComplaints(concernsHolder);
            }
            setOtherComplaints(concernsHolder);
          },
        );
      return unsub;
    },
    [setCurrentStudentComplaints, setOtherComplaints, queryId],
  );
  /** Setup `targetDocument`, `complaintRecord`, and `groupComplaints` in state.*/
  const fetchStudentConcerns = useCallback(
    ({ studentNo }: Pick<StudentInfoProps, "studentNo">) => {
      try {
        const fetchComplaintProps: FetchComplaintCollectionsProps = {
          recipient: "mayor",
        };
        fetchOtherComplaints(
          role === "mayor"
            ? fetchComplaintProps
            : { studentNo, ...fetchComplaintProps },
        );
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [role, fetchOtherComplaints],
  );
  /** Mayor's Setup for Student concerns, and Mayor's concern for Adviser */
  const mayorSetup = useCallback(
    ({ studentNo }: Pick<StudentInfoProps, "studentNo">) => {
      try {
        return fetchOtherComplaints({
          recipient: "adviser",
          studentNo: studentNo,
        });
      } catch (err) {
        console.log(err, "fetch student concerns");
      }
    },
    [fetchOtherComplaints],
  );
  /** Adviser's Setup for Student concerns, and Mayor's concerns */
  const adviserSetup = useCallback(() => {
    try {
      return fetchOtherComplaints({
        recipient: "adviser",
      });
    } catch (err) {
      console.log(err, "fetch student concerns");
    }
  }, [fetchOtherComplaints]);
  /** TODO: Add notification. If sender is anonymous, currentStudentInfo is not loaded properly */
  async function handleSend(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const complaint: ComplaintBaseProps = {
      timestamp: new Date().getTime(),
      sender:
        role === "adviser"
          ? currentUser?.email ?? "adviser"
          : currentStudentInfo?.studentNo ?? "anonymous",
      message: state.message,
    };
    if (queryId !== null) {
      const complaintDocRef = doc(collection(db, "complaints"), queryId);
      if (typeof selectedChatId === "string") {
        if (
          selectedChatId === "object" &&
          typeof state.newConcernDetails === "object"
        ) {
          const data: ComplaintProps = {
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
      const newConcernDetails: Omit<ComplaintProps, "messages"> = {
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
    return fetchClassSectionComplaints();
  }, [fetchClassSectionComplaints, queryId]);
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
      void getChattablesForStudent({ yearLevel, section });
      void fetchStudentConcerns({ studentNo });
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
    const studentNo = currentStudentInfo?.studentNo;
    if (role === "mayor" && studentNo !== undefined) {
      void mayorSetup({ studentNo });
    }
  }, [role, currentStudentInfo?.studentNo, mayorSetup]);
  /** Adviser set-up for fetching complaints */
  useEffect(() => {
    if (role === "adviser") {
      void adviserSetup();
    }
  }, [role, adviserSetup]);

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
            <RenderStudents />
            <ComplaintBoxRenderer
              data={currentStudentComplaints
                ?.filter((props) => props.studentNo === selectedStudent)
                ?.sort((a, b) => b.dateCreated - a.dateCreated)}
              heading={`${studentsInfo
                ?.filter((props) => selectedStudent === props.studentNo)[0]
                ?.name.split(",")[0]}'s Complaint/Concern(s):`}
              condition={selectedStudent !== null}
            />
          </>
        ) : (
          <RenderChatHeads
            handleNewConcern={handleNewConcern}
            data={otherComplaints
              .filter((props) => props.recipient === selectedChatHead)
              .sort((a, b) => b.dateCreated - a.dateCreated)}
            condition={showMayorModal}
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

export type { ReadComplaintBaseProps, ReadComplaintProps };
export default Complaints;
