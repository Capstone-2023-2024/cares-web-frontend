import type { ComplaintProps } from "@cares/types/complaint";
import { useContentManipulation } from "../ContentManipulationProvider";
import { useModal } from "../ModalProvider";
import { useUniversal } from "../UniversalProvider";
import { TurnOverModal } from "./TurnOverModal";

/** TODO: Add notification here */
const RenderActionButtons = ({
  targetArray,
}: {
  targetArray?: ComplaintProps;
}) => {
  const { actionButton, selectedChatId, selectedChatHead } =
    useContentManipulation();
  const { role } = useUniversal();
  const { showTurnOverModal, setShowTurnOverModal } = useModal();

  const condition =
    targetArray?.status === "processing" &&
    role === targetArray?.recipient &&
    selectedChatHead !== "class_section" &&
    selectedChatId !== "class_section";

  return (
    <div
      className={`${
        condition ? "flex" : "hidden"
      } items-center justify-center gap-2`}
    >
      <button
        className="rounded-lg bg-green-500 p-2 capitalize text-paper"
        onClick={() => void actionButton("resolved")}
      >
        resolve
      </button>
      <button
        className="rounded-lg bg-yellow-500 p-2 capitalize text-paper"
        onClick={() => setShowTurnOverModal(true)}
      >
        turn-over
      </button>
      {showTurnOverModal && <TurnOverModal />}
    </div>
  );
};

export default RenderActionButtons;
