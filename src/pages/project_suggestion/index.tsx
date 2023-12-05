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
  // interface PollsContainerStateProps extends Partial<PollProps>, Partial<FirestoreDatabaseProps> {
  // }
  // const { polls } = useProject();
  // const PollsContainerState: {target:PollsContainerStateProps} | undefined = undefined
  // const [state, setState] = useState(PollsContainerState);
  // const items = state?.target?.options
  //   ? [...shuffle([...state?.options])].map((props, index) => {
  //       const computedNumber = 1 + (props?.vote ?? -1);
  //       const paragraphStyle = {
  //         fontSize: `${computedNumber > 49 ? 50 : 12 + computedNumber}px`,
  //       };

  //       function dynamicBG() {
  //         const bgs = [
  //           "bg-secondary",
  //           "bg-purple-400",
  //           "bg-yellow-500",
  //           "bg-blue-600",
  //           "bg-orange-600",
  //         ];
  //         const min = 0;
  //         const max = bgs.length - 1;
  //         const random = Math.floor(Math.random() * (max - min + 1) + min);
  //         return bgs[random];
  //       }
  //       return (
  //         <p
  //           key={index}
  //           className={`${dynamicBG()} min-w-12 inset-y-0 h-max w-max rounded-lg p-2 capitalize text-paper shadow-sm duration-300 ease-in-out hover:z-10 hover:scale-105 hover:bg-primary`}
  //           style={paragraphStyle}
  //         >
  //           {props?.value}
  //         </p>
  //       );
  //     })
  //   : [];
  // const dayValue = 1000 * 60 * 60 * 24;

  // function shuffle(array: PollProps["options"]) {
  //   for (let i = array.length - 1; i > 0; i--) {
  //     let arrayI = array[i];
  //     const j = Math.floor(Math.random() * (i + 1));
  //     let arrayJ = array[j];
  //     [arrayI, arrayJ] = [arrayJ, arrayI];
  //   }
  //   return array;
  // }

  // async function handleExtendTime(id: string) {
  //   try {
  //     await updateDoc(doc(collection(db, "project_suggestion"), id), {
  //       dateOfExpiration: increment(dayValue),
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
  // async function handlePublish() {
  //   try {
  //     if (state.target !== undefined) {
  //       const { id, ...rest } = state.target;
  //       const options = rest.options;
  //       const length = options.length;
  //       const sortByVotes = options.sort(
  //         (a, b) => (a.value ?? -1) - (b.value ?? -1)
  //       );
  //       const mostVotedValues = sortByVotes.splice(length - 4);
  //       await updateDoc(doc(collection(db, "project_suggestion"), id), {
  //         dateOfExpiration: increment(dayValue),
  //         state: "published",
  //         options: mostVotedValues,
  //       });
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
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
      {/* {state.target !== undefined && (
        <section className="fixed inset-0 z-30 h-full min-h-screen bg-paper/95">
          <button
            className="rounded-full bg-red-500 p-2 px-3 text-xs text-paper"
            onClick={() =>
              setState((prevState) => ({ ...prevState, target: undefined }))
            }
          >
            x
          </button>

          <h3 className="p-4 text-center text-2xl font-bold">
            {state.target?.question}
          </h3>
          <div className="mx-auto flex w-max rounded-lg bg-secondary">
            <TickingClock
              expiration={state.target?.dateOfExpiration}
              title="time remaining"
            />
            <div className="p-6 text-paper">
              <button
                onClick={() => void handleExtendTime(state.target?.id ?? "")}
                className="rounded-lg bg-primary p-2 capitalize"
              >
                extend a day
              </button>
            </div>
          </div>
          <div className="mx-auto w-1/2 rounded-lg bg-paper p-4 shadow-sm">
            <p className="text-center text-lg font-semibold">Consensus</p>
            <Masonry columnsCount={6} gutter="1.5rem">
              {items}
            </Masonry>
          </div>
          <div className="mx-auto w-max rounded-lg p-2">
            <button
              onClick={() => void handlePublish()}
              className=" rounded-lg bg-secondary p-2 capitalize text-paper shadow-sm"
            >
              publish now
            </button>
          </div>
          <p className="p-2 text-sm text-primary">{state.target?.postedBy}</p>
        </section>
      )}
      <section>
        <h1 className="text-center text-lg font-semibold">
          Awaiting consensus:{" "}
        </h1>
        <div className="flex h-[60vh] flex-col gap-2 overflow-y-auto p-2">
          {[...polls.filter(({ state }) => state === "unpublished")].map(
            ({ id, question, ...rest }) => {
              return (
                <button
                  key={id}
                  onClick={() =>
                    setState((prevState) => ({
                      ...prevState,
                      target: { id, question, ...rest },
                    }))
                  }
                  onMouseEnter={(e) => {
                    const button = e.currentTarget;
                    const holder = document.createElement("p");
                    holder.textContent = "Click to get status from";
                    holder.classList.add(
                      "text-paper",
                      "bg-secondary",
                      "p-2",
                      "rounded-lg",
                      "absolute",
                      "inset-x-0",
                      "top-0",
                      "z-10",
                      "helper"
                    );
                    button.appendChild(holder);
                  }}
                  onMouseLeave={(e) => {
                    const button = e.currentTarget;
                    const helpers = button.querySelectorAll(".helper");
                    helpers.forEach((child) => {
                      button.removeChild(child);
                    });
                  }}
                  className="relative rounded-xl bg-primary/80 p-4 text-paper shadow-sm duration-300 ease-in-out hover:bg-primary"
                >
                  <p className="grid font-bold">
                    Question:<span className="font-light">{question}</span>
                  </p>
                </button>
              );
            }
          )}
        </div>
      </section>
      <section className="h-[50vh] bg-white">
        <h1 className="text-center text-lg font-semibold">Ongoing Polls: </h1>
        <div className="flex flex-col gap-2 overflow-y-auto p-2">
          {[...polls.filter(({ state }) => state === "published")].map(
            ({ id, question }) => {
              return (
                <button
                  key={id}
                  className="rounded-xl bg-yellow-300 p-4 shadow-sm"
                >
                  <p>{question}</p>
                </button>
              );
            }
          )}
        </div>
      </section> */}
    </div>
  );
};

export default ProjectSuggestion;
