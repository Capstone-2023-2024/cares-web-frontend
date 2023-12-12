import type {
  ReadPollEventProps,
  PollEventProps,
  PollProps,
} from "@cares/common/types/poll";
import { currentMonth } from "@cares/common/utils/date";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useState, type FormEvent, useEffect } from "react";
import Main from "~/components/Main";
import TickingClock from "~/components/TickingClock";
import { useAuth } from "~/contexts/AuthProvider";
import ProjectProvider from "~/contexts/ProjectProvider";
import { db } from "~/utils/firebase";

const ProjectSuggestion = () => {
  return (
    <Main>
      <ProjectProvider>
        <Content />
      </ProjectProvider>
    </Main>
  );
};

const Content = () => {
  const initState: PollProps = {
    type: "poll",
    text: "",
    days: null,
    state: "unpublished",
    postedBy: "",
    options: [],
    question: "",
    comments: [],
    dateCreated: NaN,
  };
  const [pollState, setPollState] = useState<ReadPollEventProps[]>([]);
  const { currentUser } = useAuth();
  const [state, setState] = useState(initState);
  const daysInMilliseconds = 86400000;
  const event: Omit<PollEventProps, "dateOfExpiration"> = {
    postedBy: currentUser?.email ?? "null",
    type: state.type,
    state: state.state,
    question: state.question,
    options: state.options,
    comments: [],
    dateCreated: new Date().getTime(),
  };
  const month = new Date().getMonth();
  const year = new Date().getFullYear();

  function handleDays(event: React.ChangeEvent<HTMLSelectElement>) {
    const days = event.target.value;
    const numberify = JSON.parse(days) as number;
    if (Number.isNaN(numberify)) {
      setState((prevState) => ({ ...prevState, days: numberify }));
    }
  }
  function handleQuestion(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const question = event.target.value;
    setState((prevState) => ({ ...prevState, question }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const date = new Date();
    const totalMilliseconds = (state.days ?? 1) * daysInMilliseconds;
    const totalCalculation = totalMilliseconds + date.getTime();
    const { options, ...rest } = event;
    console.log(options);
    const newEvent: Omit<PollEventProps, "options"> = {
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

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "project_suggestion"),
      (snapshot) => {
        const pollsHolder: ReadPollEventProps[] = [];
        snapshot.forEach((snap) => {
          const id = snap.id;
          const data = snap.data() as PollEventProps;
          pollsHolder.push({ id, ...data });
        });
        setPollState(pollsHolder);
      },
    );
    return unsub;
  }, []);

  return (
    <div className="h-screen">
      <h1 className="p-4 text-center text-xl font-semibold">
        {`Event Suggestions for the month of ${currentMonth({
          month,
          year,
        })?.name.toUpperCase()}`}
      </h1>
      <div className=" h-max">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex h-full flex-col items-center justify-center gap-2"
        >
          <div className="flex-row items-center justify-center">
            <label htmlFor="expiration" className="p-2 text-primary">
              Days of availability:
            </label>
            <select
              required
              className="p-2"
              id="expiration"
              value={state.days ?? 1}
              onChange={handleDays}
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
          <input onChange={() => console.log("first")} />
          <textarea
            required
            placeholder="enter a poll question to get consensus from"
            className="resize-none rounded-lg border p-4 capitalize shadow-sm"
            value={state.question}
            onChange={handleQuestion}
          />
          <input
            required
            placeholder="enter an initial options"
            className="resize-none rounded-lg border p-4 capitalize shadow-sm"
            onKeyDown={(e) => {
              const value = e.currentTarget.value;
              console.log(value);
            }}
          />
          <button
            type="submit"
            className={`${
              state.question.trim() === "" || state.options.length === 0
                ? " bg-slate-200 text-slate-300"
                : "bg-primary text-paper"
            } rounded-lg p-2 capitalize shadow-sm`}
            disabled={state.question.trim() === ""}
          >
            submit
          </button>
        </form>
        <PollsContainer pollState={pollState} />
      </div>
    </div>
  );
};

const PollsContainer = ({ pollState }: { pollState: ReadPollEventProps[] }) => {
  return (
    <div className="grid-cols-flow grid h-96 items-start gap-6 overflow-y-auto">
      {[...pollState].map(({ id, comments, options, ...rest }) => {
        return (
          <div key={id} className="rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <div className="grid gap-2">
                <h1>{rest.question}</h1>
                <p>{rest.postedBy}</p>
              </div>
              <TickingClock
                expiration={rest.dateOfExpiration}
                title="Time remaining"
              />
            </div>
            <section className="flex flex-col items-start gap-2 rounded-lg bg-primary/20 p-2 shadow-sm">
              <h2 className="front-semibold text-lg text-black">
                Click a comment to add to the current poll options
              </h2>
              {comments?.map(({ value, commenter }, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      const values = options.filter(
                        (props) => value === props.value,
                      );
                      if (values.length === 0) {
                        return void updateDoc(
                          doc(collection(db, "project_suggestion"), id),
                          {
                            options: arrayUnion({
                              index: options.length,
                              value,
                              vote: 0,
                            }),
                          },
                        );
                      }
                      alert("This option already exists in the poll!");
                    }}
                    className="relative mx-auto w-96 scale-90 rounded-lg bg-primary p-2 text-paper shadow-sm hover:scale-95 hover:bg-secondary"
                  >
                    <p className="flex flex-col items-center justify-center">
                      {value}
                      <span>{`commenter: ${commenter}`}</span>
                    </p>
                  </button>
                );
              })}
            </section>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectSuggestion;
