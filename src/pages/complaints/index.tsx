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
import { useAuth } from "~/contexts/AuthContext";
import type { ConcernProps } from "~/types/complaints";
import type { StudentWithSectionProps } from "~/types/student";
import { db } from "~/utils/firebase";
import type {
  ChatTextProps,
  ComplaintsStateProps,
  ComplaintsStateValues,
} from "~/types/complaintsPage";

const Complaints = () => {
  const initialState: ComplaintsStateProps = {
    students: [],
    concerns: [],
    message: "",
    collectionReference: null,
  };
  const { currentUser } = useAuth();
  const [state, setState] = useState(initialState);
  const studentNoSelected = state.collectionReference?.substring(8, 18);

  function handleState(
    key: keyof ComplaintsStateProps,
    value: ComplaintsStateValues
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    handleState("message", e.target.value);
  }
  async function handleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    try {
      if (e.key === "Enter" && state.message.trim() !== "") {
        const concern: Omit<ConcernProps, "id"> = {
          sender: currentUser?.email ?? "admin",
          withDocument: false,
          message: state.message,
          dateCreated: new Date().getTime(),
        };
        await addDoc(collection(db, state.collectionReference ?? ""), concern);
        handleState("message", "");
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function handleResolution() {
    const concerns: Omit<ConcernProps, "id"> = {
      sender: "system",
      withDocument: false,
      dateCreated: new Date().getTime(),
      message: "resolved",
    };
    try {
      await addDoc(collection(db, state.collectionReference ?? ""), concerns);
      await updateDoc(doc(collection(db, "student"), studentNoSelected), {
        recipient: "class_section",
      });
      handleState("concerns", []);
      handleState("collectionReference", null);
    } catch (err) {
      console.log(err);
    }
  }
  async function handleTurnOver() {
    const recipient =
      currentUser?.email === "bm@cares.com"
        ? "program_chair"
        : "department_head";
    const concerns: Omit<ConcernProps, "id"> = {
      sender: "system",
      withDocument: false,
      dateCreated: new Date().getTime(),
      message: `turnover to ${recipient.replace(/_/, " ")}`,
    };
    try {
      await addDoc(collection(db, state.collectionReference ?? ""), concerns);
      await updateDoc(doc(collection(db, "student"), studentNoSelected), {
        recipient,
      });
      handleState("concerns", []);
      handleState("collectionReference", null);
    } catch (err) {
      console.log(err);
    }
  }
  async function handleRejection() {
    const concerns: Omit<ConcernProps, "id"> = {
      sender: "system",
      withDocument: false,
      dateCreated: new Date().getTime(),
      message: "rejected",
    };
    try {
      await addDoc(collection(db, state.collectionReference ?? ""), concerns);
      await updateDoc(doc(collection(db, "student"), studentNoSelected), {
        recipient: "class_section",
      });
      handleState("concerns", []);
      handleState("collectionReference", null);
    } catch (err) {
      console.log(err);
    }
  }
  function handleIdClicked({ id }: { id: string }) {
    const colPath = `student/${id}/concerns`;
    return onSnapshot(
      query(collection(db, colPath), orderBy("dateCreated"), limit(15)),
      (snapshot) => {
        const placeholder: ConcernProps[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<ConcernProps, "id">;
          const id = doc.id;
          placeholder.push({ ...data, id });
        });
        handleState("collectionReference", colPath);
        handleState("concerns", placeholder);
      }
    );
  }
  function renderTickets() {
    return state.students.map(({ studentNo }) => {
      return (
        <button
          onClick={handleIdClicked({ id: studentNo })}
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
      ({ studentNo }) => studentNoSelected === studentNo
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
    return state.concerns.map(({ id, sender, message, dateCreated }) => {
      const date = new Date();
      date.setTime(dateCreated);
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
        collection(db, "student"),
        where("recipient", "==", "bm"),
        limit(6)
      ),
      (snapshot) => {
        const placeholder: StudentWithSectionProps[] = [];
        snapshot.forEach((doc) => {
          const studentNo = doc.id;
          const data = doc.data() as StudentWithSectionProps;
          placeholder.push({ ...data, studentNo });
        });
        handleState("students", placeholder);
      }
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

const ChatText = ({ text, condition, textSize }: ChatTextProps) => {
  function getTextSize() {
    if (textSize === "xs") {
      return "text-xs";
    } else if (textSize === "sm") {
      return "text-sm";
    } else if (textSize === "lg") {
      return "text-lg";
    } else if (textSize === "xl") {
      return "text-xl";
    }
    return "text-md";
  }
  return (
    <p
      className={`${
        condition
          ? "text-white"
          : text === "resolved"
          ? "text-green-400"
          : text === "rejected"
          ? "text-red-400"
          : text.startsWith("turn")
          ? "text-yellow-400"
          : "text-black"
      } ${getTextSize()}`}
    >
      {text}
    </p>
  );
};

export default Complaints;
