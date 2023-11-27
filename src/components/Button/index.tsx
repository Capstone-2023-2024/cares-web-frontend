import type { ButtonType } from "./types";

const Button = (props: ButtonType) => {
  const { primary, error, children, success, text, rounded, ...rest } = props;
  let base =
    " py-4 px-10 sm:px-18 capitalize duration-300 ease-in-out text-sm sm:text-base";

  function style() {
    if (rounded) base += " rounded-xl";
    if (primary)
      return `${base} ${
        props?.disabled
          ? "bg-slate-200 text-slate-300"
          : "bg-primary text-white hover:bg-secondary"
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
