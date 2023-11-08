import Image from "next/image";
import type { ActionButtonProps } from "./types";

const ActionButton = ({ text, color, src, ...rest }: ActionButtonProps) => {
  const DIMENSION = 40;
  function getColor() {
    if (color === "red") {
      return "bg-red-500 text-white";
    } else if (color === "yellow") {
      return "bg-yellow-500 text-white";
    } else if (color === "green") {
      return "bg-green-500 text-white";
    }
    return "bg-slate-200 text-slate-300";
  }
  return (
    <button
      {...rest}
      className={`${getColor()} flex h-max w-max items-center gap-2 rounded-xl p-2`}
    >
      {src ? (
        <Image width={DIMENSION} height={DIMENSION} src={src} alt="icon" />
      ) : (
        <></>
        // <p className="text-xs">icon</p>
      )}
      <p>{text}</p>
    </button>
  );
};

export default ActionButton;
