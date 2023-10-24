import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import ActionButton from "~/components/Actionbutton";
import Main from "~/components/Main";
import { ConcernProps } from "~/types/complaints";
import { db } from "~/utils/firebase";
import type { ChatTextProps } from "./types";

interface IdProps {
  id: string;
}

interface StateProps {
  idList: IdProps[];
  concerns: ConcernProps[];
  message: string;
  collectionReference: string | null;
}

type StateValues =
  | StateProps["idList"]
  | StateProps["concerns"]
  | StateProps["message"]
  | StateProps["collectionReference"];

const Complaints = () => {
  const initialState = {
    idList: [],
    concerns: [],
    message: "",
    collectionReference: null,
  };
  const [state, setState] = useState<StateProps>(initialState);

  function handleState(key: keyof StateProps, value: StateValues) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    handleState("message", e.target.value);
  }

  async function handleEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && state.message.trim() !== "") {
      const concern: Omit<ConcernProps, "id"> = {
        sender: "admin",
        withDocument: false,
        message: state.message,
        dateCreated: new Date().getTime(),
      };
      await addDoc(collection(db, state.collectionReference ?? ""), concern);
      handleState("message", "");
    }
  }

  function handleResolution() {
    console.log("handleResolution");
  }
  function handleTurnOver() {
    console.log("handleTurnOver");
  }
  function handleRejection() {
    console.log("handleRejection");
  }

  async function handleIdClicked(id: string) {
    const year = new Date().getFullYear().toString();
    const month = new Date().getMonth().toString();
    const date = new Date().getDate().toString();
    const collectionPath = `concerns/${id}/${year}-${month}-${date}`;
    const colRef = collection(db, collectionPath);
    const unsub = onSnapshot(
      query(colRef, limit(12), orderBy("dateCreated")),
      (snapshot) => {
        const placeholder: ConcernProps[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<ConcernProps, "id">;
          const id = doc.id;
          placeholder.push({ ...data, id });
        });
        handleState("concerns", placeholder);
      }
    );
    handleState("collectionReference", collectionPath);
    return unsub;
  }

  function renderIds() {
    return state.idList.map(({ id }) => {
      return (
        <button
          onClick={() => handleIdClicked(id)}
          key={id}
          className={`${
            state.collectionReference?.substring(9, 19) === id
              ? "bg-green-300"
              : "odd:bg-primary/25"
          } p-2`}
        >
          <p>{id}</p>
        </button>
      );
    });
  }

  function renderConcerns() {
    const authenticated = "admin";
    return state.concerns.map(({ id, sender, message, dateCreated }) => {
      const date = new Date();
      date.setTime(dateCreated);
      return (
        <div
          key={id}
          className={`m-2 w-max rounded-lg p-2 shadow-sm ${
            sender === authenticated
              ? "self-end bg-blue-400"
              : "self-start bg-slate-200"
          }`}
        >
          <ChatText text={sender} condition={sender === authenticated} />
          <ChatText text={message} condition={sender === authenticated} />
          <ChatText
            text={date.toLocaleTimeString()}
            condition={sender === authenticated}
          />
        </div>
      );
    });
  }

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "concerns"),
          limit(6),
          orderBy("dateUpdated", "desc")
        ),
        (snapshot) => {
          const placeholder: IdProps[] = [];
          snapshot.forEach((doc) => {
            placeholder.push({ id: doc.id });
          });
          handleState("idList", placeholder);
        }
      ),
    []
  );

  return (
    <Main>
      <div className="inline-block h-screen w-1/4 border align-top">
        <section className="flex h-full flex-col justify-start">
          {renderIds()}
        </section>
      </div>
      {state.collectionReference !== null && (
        <div className="inline-block h-screen w-3/4">
          <div className="flex h-1/6 w-full items-center justify-center gap-2 bg-primary/25">
            <ActionButton
              onClick={handleResolution}
              text="resolved"
              color="green"
            />
            <ActionButton
              onClick={handleTurnOver}
              text="turn-over"
              color="yellow"
            />
            <ActionButton onClick={handleRejection} text="reject" color="red" />
          </div>
          <section className="flex h-4/6 flex-col overflow-y-auto">
            {renderConcerns()}
          </section>
          <textarea
            className="h-1/6 w-full resize-none border border-black p-2"
            value={state.message}
            onChange={handleChange}
            onKeyDown={handleEnter}
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
      className={`${condition ? "text-white" : "text-black"} ${getTextSize()}`}
    >
      {text}
    </p>
  );
};

export default Complaints;
