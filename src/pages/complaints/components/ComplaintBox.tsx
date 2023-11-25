import type { ClassSectionProps } from "@cares/types/user";
import { setUpPrefix } from "@cares/utils/date";
import { recipientEscalation } from "@cares/utils/validation";
import {
  addDoc,
  and,
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { type ChangeEvent, useCallback, useState } from "react";
import { collectionRef } from "~/types/firebase";
import { db } from "~/utils/firebase";
import { useComplaints } from "../ComplaintsProvider";
import { useContentManipulation } from "../ContentManipulationProvider";
import { useModal } from "../ModalProvider";
import { useUniversal } from "../UniversalProvider";
import ProfilePictureContainer from "./ProfilePictureContainer";
import { TurnOverModal } from "./TurnOverModal";

const StyledDateTime = ({ timestamp }: { timestamp: Date }) => {
  return <p className="text-xs font-thin">{setUpPrefix(timestamp)}</p>;
};

const ComplaintBox = () => {
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
    async ({ yearLevel, section }: ClassSectionProps) => {
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
          const renderCondition =
            role === "adviser"
              ? sender === adviserInfo?.email
              : sender === currentStudentInfo?.studentNo;

          return (
            <ProfilePictureContainer
              key={index}
              renderCondition={renderCondition}
              src={
                sender === adviserInfo?.email
                  ? adviserInfo?.src ?? ""
                  : targetStudent?.src ?? ""
              }
            >
              <div
                className={`${
                  renderCondition ? "text-end" : "text-start"
                } relative flex-1 p-1`}
              >
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
                </div>
              </div>
              <StyledDateTime timestamp={newTimestamp} />
            </ProfilePictureContainer>
          );
        })}
      </div>
    </>
  );
};

export default ComplaintBox;
