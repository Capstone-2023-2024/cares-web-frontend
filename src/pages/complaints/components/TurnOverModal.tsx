import type { ChangeEvent } from "react";
import type { ComplaintProps } from "@cares/types/complaint";

interface TurnOverModalProps {
  closingModal: () => void;
  handleTurnOverMessage: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  turnOverMessage: string;
  handleTurnOver: () => void;
}
interface TurnOverMessageProps {
  recipient?: ComplaintProps["recipient"];
  status?: "turn-over" | "resolved" | "processing";
  turnOvers?: number;
}

const TurnOverModal = ({
  closingModal,
  handleTurnOver,
  turnOverMessage,
  handleTurnOverMessage,
}: TurnOverModalProps) => {
  return (
    <div className="fixed inset-0 z-20 bg-blue-400">
      <button
        className="absolute right-2 top-2 rounded-full bg-red-500 px-2"
        onClick={closingModal}
      >
        <p className="text-white">x</p>
      </button>
      <textarea
        className="p-2"
        placeholder="Compose a turn-over message to send to your adviser"
        value={turnOverMessage}
        onChange={(e) => handleTurnOverMessage(e)}
      />
      <button
        disabled={turnOverMessage.trim() === ""}
        className={`${
          turnOverMessage.trim() === ""
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

export { TurnOverModal, TurnOverMessage };
