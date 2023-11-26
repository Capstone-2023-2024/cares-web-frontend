import type { ComplaintProps } from "@cares/types/complaint";
import { useState, type ChangeEvent } from "react";
import { useContentManipulation } from "../ContentManipulationProvider";
import { useModal } from "../ModalProvider";

interface TurnOverMessageProps {
  recipient?: ComplaintProps["recipient"];
  status?: "turn-over" | "resolved" | "processing";
  turnOvers?: number;
}

const TurnOverModal = () => {
  const { setShowTurnOverModal } = useModal();
  const { actionButton, setTurnOverMessage } = useContentManipulation();
  const [state, setState] = useState({
    turnOverMessage: "",
  });

  function closeTurnOverModal() {
    setShowTurnOverModal(false);
  }

  function handleTurnOver() {
    setShowTurnOverModal(false);
    setTurnOverMessage(state.turnOverMessage);
    void actionButton("turn-over");
    setTurnOverMessage(null);
    setState((prevState) => ({ ...prevState, turnOverMessage: "" }));
  }

  function handleTurnOverMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const turnOverMessage = event.target.value;
    setState((prevState) => ({ ...prevState, turnOverMessage }));
  }

  return (
    <div className="fixed inset-0 z-20 bg-blue-400">
      <button
        className="absolute right-2 top-2 rounded-full bg-red-500 px-2"
        onClick={closeTurnOverModal}
      >
        <p className="text-white">x</p>
      </button>
      <textarea
        className="p-2"
        placeholder="Compose a turn-over message to send to your adviser"
        value={state.turnOverMessage}
        onChange={handleTurnOverMessage}
      />
      <button
        disabled={state.turnOverMessage.trim() === ""}
        className={`${
          state.turnOverMessage.trim() === ""
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

const TurnOverMessage = ({
  recipient,
  status,
  turnOvers,
}: TurnOverMessageProps) => {
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

export { TurnOverMessage, TurnOverModal };
