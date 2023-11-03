import React, { FormEvent, useState } from "react";
import Main from "~/components/Main";
import type { EventProps, StateProps, StateValues } from "./types";
import { addDoc, collection } from "firebase/firestore";
import { db } from "~/utils/firebase";

const ProjectSuggestion = () => {
  const initState: StateProps = {
    type: "poll",
    state: "unpublished",
    options: [],
    question: "",
    text: "",
    days: null,
  };
  const [state, setState] = useState(initState);
  const publishCondition =
    state.options.length > 1 && state.question.trim() !== "";
  const daysInMilliseconds = 86400000;
  const event: Omit<EventProps, "dateOfExpiration"> = {
    type: state.type,
    state: state.state,
    question: state.question,
    options: state.options,
    dateCreated: new Date().getTime(),
  };

  function handleState(key: keyof StateProps, value: StateValues) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }
  function handlePollOption(e: React.ChangeEvent<HTMLInputElement>) {
    handleState("text", e.target.value);
  }
  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (state.text.trim() !== "" && e.key === "Enter") {
      const holder = state.options;
      holder.push({ value: state.text });
      handleState("text", "");
      handleState("options", holder);
    }
  }
  function handleQuestion(e: React.ChangeEvent<HTMLTextAreaElement>) {
    handleState("question", e.target.value);
  }
  function handleRemovePollItem(index: number) {
    const holder = state.options.filter((val) => val !== state.options[index]);
    handleState("options", holder);
  }
  async function handlePublish() {
    if (state.days !== null) {
      try {
        await addDoc(collection(db, "project_suggestion"), event);
        setState(initState);
      } catch (err) {
        console.log(err);
      }
    }
  }
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const date = new Date();
    const totalMilliseconds = (state.days ?? 1) * daysInMilliseconds;
    const totalCalculation = totalMilliseconds + date.getTime();
    const { options, ...rest } = event;
    const newEvent: Omit<EventProps, "options"> = {
      ...rest,
      dateOfExpiration: totalCalculation,
    };

    try {
      await addDoc(collection(db, "project_suggestion"), newEvent);
      setState(initState);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Main>
      <div className="h-screen">
        <h1 className="font-semibold">
          Create a Poll for Project/Event Suggestions
        </h1>
        <div className=" h-max bg-secondary">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col items-center justify-center gap-2"
          >
            <div className="flex-row items-center justify-center">
              <label htmlFor="expiration" className="p-2 text-paper">
                Days of availability:
              </label>
              <select
                required
                className="p-2"
                id="expiration"
                value={state.days ?? 1}
                onChange={(e) => handleState("days", e.target.value)}
              >
                {new Array(30).fill(0).map((v, index) => {
                  return (
                    <option key={index} value={index + 1}>
                      {index + 1}
                    </option>
                  );
                })}
              </select>
            </div>
            <textarea
              required
              placeholder="enter a poll question to get consensus from"
              className="resize-none border p-2 capitalize shadow-sm"
              value={state.question}
              onChange={handleQuestion}
            />
            <button
              type="submit"
              className={`${
                state.question.trim() === ""
                  ? " bg-slate-200 text-slate-300"
                  : "bg-primary text-paper"
              } rounded-lg p-2 capitalize shadow-sm`}
              disabled={state.question.trim() === ""}
            >
              submit
            </button>
          </form>
        </div>
        {/* <div className="inline-block h-max w-1/2">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <h1 className="font-semibold">
              Create a Poll for Project/Event Suggestions
            </h1>
            <textarea
              placeholder="enter the poll question"
              className="resize-none border p-2 shadow-sm"
              value={state.question}
              onChange={handleQuestion}
            />
            <input
              placeholder="enter a poll option"
              className="resize-none border p-2 shadow-sm"
              value={state.text}
              onChange={handlePollOption}
              onKeyDown={handleEnter}
            />
          </div>
        </div> */}
        {/* <div className="inline-block h-max w-1/2 ">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="font-semibold">Preview: </p>
            <section className="mx-auto w-fit rounded-lg bg-paper p-2 shadow-sm">
              <h2 className="p-2 text-center font-bold">{state.question}</h2>
              {state.options.map(({ value }, index) => {
                return (
                  <div key={index} className="flex justify-between border p-2">
                    <p>{value}</p>
                    <button
                      onClick={() => handleRemovePollItem(index)}
                      className="rounded-full bg-red-500 p-1 px-3 text-white"
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </section>
            <button
              onClick={handlePublish}
              disabled={!publishCondition}
              className={`${
                !publishCondition
                  ? "bg-slate-200 text-slate-300"
                  : "bg-secondary text-white"
              } rounded-lg p-2 capitalize shadow-sm`}
            >
              publish
            </button>
          </div>
        </div> */}
      </div>
    </Main>
  );
};

export default ProjectSuggestion;
