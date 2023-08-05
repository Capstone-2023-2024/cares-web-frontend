import React, { type HTMLAttributes } from "react";

interface ButtonType extends HTMLAttributes<HTMLButtonElement> {
  text: string;
  primary?: boolean;
  error?: boolean;
  success?: boolean;
  type?: "reset" | "submit" | "button";
  rounded?: boolean;
}

const Button = (props: ButtonType) => {
  const { primary, error, success, text, rounded, ...rest } = props;
  let base = "p-2 px-4 capitalize";

  function style() {
    if (rounded) base += " rounded-xl";
    if (primary) return `${base} bg-primary text-white`;
    else if (error) return `${base} bg-error text-white`;
    else if (success) return `${base} bg-sucess text-white`;
    return `${base} text-black text-xs`;
  }

  return (
    <button {...rest} className={style()}>
      {text}
    </button>
  );
};

export default Button;
