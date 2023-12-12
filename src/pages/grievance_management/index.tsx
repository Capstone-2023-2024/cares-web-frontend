import type {
  ComplaintBaseProps,
  ComplaintProps,
  ReadComplaintProps,
} from "@cares/common/types/complaint";
import type { FirestoreDatabaseProps } from "@cares/common/types/document";
import type { StudentInfoProps } from "@cares/common/types/user";
import { imageDimension } from "@cares/common/utils/media";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import ActionButton from "~/components/Actionbutton";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthProvider";
import { db } from "~/utils/firebase";

interface ReadStudentInfoProps
  extends StudentInfoProps,
    FirestoreDatabaseProps {}
// interface ReadComplaintBaseProps
//   extends ComplaintBaseProps,
//     FirestoreDatabaseProps {}

interface ComplaintsStateProps {
  students: ReadStudentInfoProps[];
  concerns: ReadComplaintProps[];
  selectedConcern: ReadComplaintProps | null;
  message: string;
  sections: {
    id: string;
    academicYear: string;
    section: string;
    time: number;
    yearLevel: string;
  }[];
  collectionReference: string | null;
}
interface ChatTextProps {
  text: string;
  condition: boolean;
  size?: "xs" | "sm" | "lg" | "xl";
}

const Complaints = () => {
  const initialState: ComplaintsStateProps = {
    students: [],
    concerns: [],
    selectedConcern: null,
    sections: [],
    message: "",
    collectionReference: null,
  };
  const { currentUser, typeOfAccount } = useAuth();
  const [state, setState] = useState(initialState);
  const studentNoSelected = state.collectionReference?.substring(8, 18);

  console.log({ typeOfAccount });
  // function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
  //   setState((prevState) => ({ ...prevState, message: e.target.value }));
  // }
  // async function handleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  //   try {
  //     if (e.key === "Enter" && state.message.trim() !== "") {
  //       const concern: ComplaintBaseProps = {
  //         sender: currentUser?.email ?? "admin",
  //         message: state.message,
  //         timestamp: new Date().getTime(),
  //       };
  //       await addDoc(collection(db, state.collectionReference ?? ""), concern);
  //       setState((prevState) => ({
  //         ...prevState,
  //         message: initialState.message,
  //       }));
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
  async function handleResolution() {
    const concerns: ComplaintBaseProps = {
      sender: "system",
      message: "resolved",
      timestamp: new Date().getTime(),
    };
    try {
      await addDoc(collection(db, state.collectionReference ?? ""), concerns);
      await updateDoc(doc(collection(db, "student"), studentNoSelected), {
        recipient: "class_section",
      });
      setState((prevState) => ({
        ...prevState,
        concerns: [],
        collectionReference: null,
      }));
    } catch (err) {
      console.log(err);
    }
  }
  async function handleTurnOver() {
    const recipient =
      currentUser?.email === "bm@cares/common.com"
        ? "program_chair"
        : "department_head";
    const concerns: ComplaintBaseProps = {
      sender: "system",
      message: `turnover to ${recipient.replace(/_/, " ")}`,
      timestamp: new Date().getTime(),
    };
    try {
      await addDoc(collection(db, state.collectionReference ?? ""), concerns);
      await updateDoc(doc(collection(db, "student"), studentNoSelected), {
        recipient,
      });
      setState((prevState) => ({
        ...prevState,
        concerns: [],
        collectionReference: null,
      }));
    } catch (err) {
      console.log(err);
    }
  }
  async function handleRejection() {
    const concerns: ComplaintBaseProps = {
      sender: "system",
      message: "rejected",
      timestamp: new Date().getTime(),
    };
    try {
      await addDoc(collection(db, state.collectionReference ?? ""), concerns);
      await updateDoc(doc(collection(db, "student"), studentNoSelected), {
        recipient: "class_section",
      });
      setState((prevState) => ({
        ...prevState,
        concerns: [],
        collectionReference: null,
      }));
    } catch (err) {
      console.log(err);
    }
  }
  function handleSection(id: string) {
    const complaintCol = collection(db, "complaints");
    const sectionDoc = collection(complaintCol, id, "individual");
    onSnapshot(
      query(sectionDoc, where("recipient", "!=", "adviser")),
      (snapshot) => {
        const holder: ReadComplaintProps[] = [];
        const studentHolder: ReadStudentInfoProps[] = [];
        snapshot.docs.forEach((props) => {
          const data = props.data() as ComplaintProps;
          const id = props.id;
          getDoc(doc(db, "student", data.studentNo))
            .then((student) => {
              const studentInfo = student.data() as StudentInfoProps;
              const studentId = student.id;
              studentHolder.push({ ...studentInfo, id: studentId });
            })
            .catch((err) => console.log(err));
          holder.push({ ...data, id });
        });
        console.log(studentHolder);
        setState((prevState) => ({
          ...prevState,
          concerns: holder,
          selectedConcern: null,
          students: studentHolder,
        }));
      },
    );
  }

  const renderActionButtons = () => {
    const student = state.students.filter(
      ({ studentNo }) => studentNoSelected === studentNo,
    )[0];
    return (
      <div className="bg-primary/25 p-2">
        <p>{student?.name}</p>
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            onClick={() => void handleResolution()}
            text="resolved"
            color="green"
          />
          <ActionButton
            onClick={() => void handleTurnOver()}
            text="turn-over"
            color="yellow"
          />
          <ActionButton
            onClick={() => void handleRejection()}
            text="reject"
            color="red"
          />
        </div>
      </div>
    );
  };
  function renderConcerns() {
    const authenticated = currentUser?.email;
    return state.concerns
      .filter((props) => props.recipient !== "mayor")
      .map(({ id, messages, dateCreated }) => {
        const date = new Date();
        date.setTime(dateCreated);
        return messages.map(({ message, sender }, index) => {
          return (
            <div
              key={index}
              className={`m-2 w-max rounded-lg p-2 shadow-sm ${
                sender === authenticated
                  ? "self-end bg-blue-400"
                  : sender === "system"
                    ? "self-center text-center"
                    : "self-start bg-slate-200"
              }`}
            >
              {sender !== "system" && (
                <ChatText text={sender} condition={sender === authenticated} />
              )}
              <ChatText text={message} condition={sender === authenticated} />
              <ChatText
                text={date.toLocaleTimeString()}
                condition={sender === authenticated}
              />
            </div>
          );
        });
      });
  }

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "complaints"), limit(6)),
      (snapshot) => {
        const sectionsHolder: ComplaintsStateProps["sections"] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as Omit<
            ComplaintsStateProps["sections"][0],
            "id"
          >;
          sectionsHolder.push({ ...data, id });
        });
        setState((prevState) => ({ ...prevState, sections: sectionsHolder }));
      },
    );
    return unsub;
  }, []);

  return (
    <Main>
      <div className="inline-block h-screen w-1/4 border align-top">
        {state.concerns.length > 0 && (
          <div className="grid gap-2">
            {state.concerns
              .filter((props) => props.recipient !== "mayor")
              .map(({ studentNo, ...rest }, index) => {
                return (
                  <button
                    key={index}
                    onClick={() =>
                      setState((prevState) => ({
                        ...prevState,
                        selectedConcern: { studentNo, ...rest },
                      }))
                    }
                  >
                    {studentNo}
                  </button>
                );
              })}
          </div>
        )}
      </div>
      <div className="inline-block w-3/4">
        <section className="right-0 top-0 flex flex-col items-center justify-center gap-2 bg-primary p-2 text-paper">
          <h1 className="text-lg font-semibold">Sections</h1>
          <div className="flex">
            {state.sections
              .sort((a, b) => a.yearLevel.localeCompare(b.yearLevel))
              .map(({ yearLevel, section, id }) => {
                return (
                  <button
                    className="rounded-lg bg-blue-400 p-2 text-paper shadow-sm"
                    onClick={() => void handleSection(id)}
                    key={id}
                  >{`${yearLevel}${section.toUpperCase()}`}</button>
                );
              })}
          </div>
        </section>
        <div>
          {state.selectedConcern !== null && (
            <div>
              <h1>{`Document ID: ${state.selectedConcern.id}`}</h1>
              <div className="grid-flow-cols grid">
                {state.selectedConcern.messages.map(
                  ({ message, sender }, index) => {
                    return (
                      <div
                        key={index}
                        className={`${
                          sender !== currentUser?.email
                            ? "items-start"
                            : "items-end"
                        } flex flex-1 flex-col p-4`}
                      >
                        <img
                          src={
                            state.students.filter(
                              (props) => props.studentNo === sender,
                            )[0]?.src ?? ""
                          }
                          {...imageDimension(12)}
                          alt=""
                        />
                        <div>
                          <p>{message}</p>
                          <p>{sender}</p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Main>
  );
};

const ChatText = ({ text, condition, size }: ChatTextProps) => {
  function getTextSize() {
    switch (size) {
      case "xs":
        return "text-xs";
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      default:
        return "text-md";
    }
  }
  function getTextColor() {
    switch (text) {
      case "resolved":
        return "text-green-500";
      case "turn-over":
        return "text-green-500";
      default:
        return "text-yellow-500";
    }
  }
  return (
    <p
      className={`${
        condition ? "text-white" : getTextColor()
      } ${getTextSize()}`}
    >
      {text}
    </p>
  );
};

export default Complaints;
