import type { ButtonType } from "./types";

const Button = (props: ButtonType) => {
  const { primary, error, children, success, text, rounded, ...rest } = props;
  let base = "p-2 px-4 capitalize duration-300 ease-in-out";

  function style() {
    if (rounded) base += " rounded-xl";
    if (primary)
      return `${base} ${
        props?.disabled
          ? "bg-slate-200 text-slate-300"
          : "bg-primary text-white"
      }`;
    else if (error)
      return `${base} ${
        props?.disabled ? "bg-slate-200 text-slate-300" : "bg-error text-white"
      }`;
    else if (success)
      return `${base} ${
        props?.disabled ? "bg-slate-200 text-slate-300" : "bg-sucess text-white"
      }`;
    return `${base} text-black text-xs`;
  }

  return (
    <button {...rest} className={style()}>
      {text ? text : children}
    </button>
  );
};

export default Button;
