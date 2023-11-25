import type { HTMLAttributes } from "react";

interface ChatHeadButtonProps extends HTMLAttributes<HTMLButtonElement> {
  name: string;
  disabled?: boolean;
  condition: boolean;
  replaceTrueButtonStyle?: string;
  replaceFalseButtonStyle?: string;
  replaceButtonBaseStyle?: string;
  replaceTrueTextStyle?: string;
  replaceFalseTextStyle?: string;
  replaceTextBaseStyle?: string;
}

const ChatHeadButton = ({
  name,
  condition,
  replaceTrueButtonStyle,
  replaceFalseButtonStyle,
  replaceButtonBaseStyle,
  replaceTrueTextStyle,
  replaceFalseTextStyle,
  replaceTextBaseStyle,
  ...rest
}: ChatHeadButtonProps) => {
  const buttonBaseStyle = "rounded-xl p-2 capitalize duration-300 ease-in-out";
  const trueButtonBaseStyle = "bg-secondary";
  const falseButtonBaseStyle = "bg-primary";
  const textBaseStyle = "text-white";
  const trueTextBaseStyle = "";
  const falseTextBaseStyle = "";

  const trueButtonStyle = replaceTrueButtonStyle ?? trueButtonBaseStyle;
  const falseButtonStyle = replaceFalseButtonStyle ?? falseButtonBaseStyle;
  const getBaseButtonStyle = replaceButtonBaseStyle ?? buttonBaseStyle;
  const conditionalButtonStyle = condition ? trueButtonStyle : falseButtonStyle;

  const trueTextStyle = replaceTrueTextStyle ?? trueTextBaseStyle;
  const falseTextStyle = replaceFalseTextStyle ?? falseTextBaseStyle;
  const getBaseTextStyle = replaceTextBaseStyle ?? textBaseStyle;
  const conditionalTextStyle = condition ? trueTextStyle : falseTextStyle;

  return (
    <button
      {...rest}
      className={`${getBaseButtonStyle} ${conditionalButtonStyle}`}
    >
      <p className={`${getBaseTextStyle} ${conditionalTextStyle}`}>{name}</p>
    </button>
  );
};

export default ChatHeadButton;
