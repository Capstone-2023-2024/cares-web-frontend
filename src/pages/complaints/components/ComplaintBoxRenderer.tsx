import type { ComplaintProps } from "@cares/types/complaint";
import type { FirestoreDatabaseProps } from "@cares/types/document";
import { recipientEscalation } from "@cares/utils/validation";
import { useContentManipulation } from "../ContentManipulationProvider";
import { useModal } from "../ModalProvider";
import { useUniversal } from "../UniversalProvider";
import { TurnOverMessage } from "./TurnOverModal";

interface ReadComplaintProps extends ComplaintProps, FirestoreDatabaseProps {}

interface ComplaintBoxRendererProps {
  data?: ReadComplaintProps[];
  heading?: string;
  condition: boolean;
  handleNewConcern?: () => void;
}
const ComplaintBoxRenderer = ({
  data,
  heading,
  condition,
  handleNewConcern,
}: ComplaintBoxRendererProps) => {
  const { role } = useUniversal();
  const {
    selectedChatHead,
    selectedChatId,
    setSelectedStudent,
    setSelectedChatId,
  } = useContentManipulation();
  const { showMayorModal, setShowStudents, setShowMayorModal } = useModal();

  function toggleModal() {
    if (selectedChatHead === "students") {
      selectedChatId === null && setSelectedStudent(null);
      setSelectedChatId(null);
      return setShowStudents(true);
    }
    setShowMayorModal(!showMayorModal);
  }

  function handleSelectComplaintHead(id: string) {
    if (selectedChatHead !== "students") {
      setSelectedStudent(null);
    }
    setSelectedChatId(id);
  }

  return (
    <div className="relative">
      {condition && (
        <button
          onClick={toggleModal}
          className="top-0 w-full bg-secondary/90 p-2 text-paper duration-300 ease-in-out hover:bg-secondary"
        >
          {/** TODO: Change this to icons */}
          {selectedChatId !== null ? "up_icon" : "bottom_icon"}
        </button>
      )}
      <div
        className={`${
          condition ? "block" : "hidden"
        } relative p-2 text-center ease-in-out`}
      >
        <h2 className="p-2 text-lg font-bold">
          {heading ? heading : "Your Complaint/Concern(s)"}
        </h2>
        <div className="flex w-full gap-2 overflow-x-auto p-2">
          {data?.map(
            ({ id, messages, dateCreated, status, turnOvers, recipient }) => {
              const date = new Date();
              const timestamp = new Date();
              const selectedMessage = messages[messages.length - 1];

              date.setTime(dateCreated);
              timestamp.setTime(selectedMessage?.timestamp ?? -28800000);
              return (
                <button
                  key={id}
                  disabled={!condition}
                  className={`${
                    selectedChatId === id
                      ? "scale-95 bg-secondary/90 hover:bg-secondary"
                      : "scale-90 bg-primary/60 hover:scale-95 hover:bg-primary/70"
                  } rounded-lg p-2 text-start shadow-sm duration-300 ease-in-out`}
                  onClick={() => handleSelectComplaintHead(id)}
                >
                  <div className="flex gap-2">
                    <p className="text-xs text-paper">id:</p>
                    <p
                      className={`${
                        selectedChatId === id
                          ? "font-bold text-paper"
                          : "text-secondary"
                      } text-xs duration-300 ease-in-out`}
                    >
                      {id}
                    </p>
                  </div>
                  <p className="text-sm text-paper">
                    Status:
                    <span
                      className={`${
                        status === "processing"
                          ? "text-yellow-500"
                          : status === "resolved"
                            ? "text-green-500"
                            : "text-red-500"
                      } pl-2 font-bold capitalize`}
                    >
                      <TurnOverMessage
                        recipient={recipient}
                        status={status}
                        turnOvers={turnOvers}
                      />
                    </span>
                  </p>
                  <p className="text-sm text-paper">{`Recent Message: ${selectedMessage?.message.substring(
                    0,
                    selectedMessage.message.length > 6
                      ? 4
                      : selectedMessage.message.length,
                  )}...`}</p>
                  <p className="text-xs font-thin text-paper">{`Date: ${date.toLocaleDateString()}`}</p>
                </button>
              );
            },
          )}
        </div>
        {handleNewConcern !== undefined &&
          selectedChatHead ===
            (role === "mayor" ? recipientEscalation(role) : "mayor") && (
            <button
              disabled={selectedChatId === "object"}
              className={`${
                selectedChatId === "object"
                  ? "bg-slate-200"
                  : "scale-90 bg-green-400 hover:scale-95 hover:bg-green-500"
              } mx-auto w-fit rounded-lg p-2 duration-300 ease-in-out`}
              onClick={handleNewConcern}
            >
              <p
                className={`${
                  selectedChatId === "object" ? "text-slate-300" : "text-paper"
                }`}
              >
                Create new Complaint/Concern(s)
              </p>
            </button>
          )}
      </div>
    </div>
  );
};

export type { ComplaintBoxRendererProps };
export default ComplaintBoxRenderer;
