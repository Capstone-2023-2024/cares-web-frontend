import type { ComplaintBaseProps } from "@cares/types/complaint";
import type { FirestoreDatabaseProps } from "@cares/types/document";
import type { StudentInfoProps } from "@cares/types/user";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
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
interface ReadComplaintBaseProps
  extends ComplaintBaseProps,
    FirestoreDatabaseProps {}

interface ComplaintsStateProps {
  students: ReadStudentInfoProps[];
  concerns: ReadComplaintBaseProps[];
  message: string;
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
    message: "",
    collectionReference: null,
  };
  const { currentUser, typeOfAccount } = useAuth();
  const [state, setState] = useState(initialState);
  const studentNoSelected = state.collectionReference?.substring(8, 18);

  console.log({ typeOfAccount });
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setState((prevState) => ({ ...prevState, message: e.target.value }));
  }
  async function handleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    try {
      if (e.key === "Enter" && state.message.trim() !== "") {
        const concern: ComplaintBaseProps = {
          sender: currentUser?.email ?? "admin",
          message: state.message,
          timestamp: new Date().getTime(),
        };
        await addDoc(collection(db, state.collectionReference ?? ""), concern);
        setState((prevState) => ({
          ...prevState,
          message: initialState.message,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  }
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
      currentUser?.email === "bm@cares.com"
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
  function handleIdClicked({ id }: { id: string }) {
    const colPath = `student/${id}/concerns`;
    return onSnapshot(
      query(collection(db, colPath), orderBy("dateCreated"), limit(15)),
      (snapshot) => {
        const placeholder: ReadComplaintBaseProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as ComplaintBaseProps;
          placeholder.push({ ...data, id });
        });
        setState((prevState) => ({
          ...prevState,
          concerns: placeholder,
          collectionReference: colPath,
        }));
      },
    );
  }
  function renderTickets() {
    return state.students.map(({ studentNo }) => {
      return (
        <button
          onClick={() => handleIdClicked({ id: studentNo })}
          key={studentNo}
          className={`${
            studentNoSelected === studentNo
              ? "bg-green-300"
              : "odd:bg-primary/25"
          } p-2`}
        >
          <p>{studentNo}</p>
        </button>
      );
    });
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
    return state.concerns.map(({ id, sender, message, timestamp }) => {
      const date = new Date();
      date.setTime(timestamp);
      console.log(message);
      return (
        <div
          key={id}
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
  }

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, "complaints"),
        where("recipient", "==", "bm"),
        limit(6),
      ),
      (snapshot) => {
        const placeholder: ReadStudentInfoProps[] = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          const data = doc.data() as StudentInfoProps;
          placeholder.push({ ...data, id });
        });
        setState((prevState) => ({ ...prevState, students: placeholder }));
      },
    );
    return unsub;
  }, [currentUser]);

  return (
    <Main>
      <div className="inline-block h-screen w-1/4 border align-top">
        <section className="flex h-full flex-col justify-start">
          {renderTickets()}
        </section>
      </div>
      {state.concerns.length > 0 && (
        <div className="inline-block h-screen w-3/4">
          {renderActionButtons()}
          <section className="flex h-4/6 flex-col overflow-y-auto">
            {renderConcerns()}
          </section>
          <textarea
            className="h-1/6 w-full resize-none border border-black p-2"
            value={state.message}
            onChange={handleChange}
            onKeyDown={(e) => void handleEnter(e)}
          />
        </div>
      )}
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
