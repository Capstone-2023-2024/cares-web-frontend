import type { SelectionProps } from "./type";

const Selection = ({ options, ...rest }: SelectionProps<string>) => {
  return (
    <select
      {...rest}
      className={`${
        rest.disabled
          ? "bg-slate-200 text-slate-300"
          : "cursor-pointer bg-primary text-paper hover:bg-secondary"
      } w-full min-w-max rounded-lg p-2 capitalize duration-300 ease-in-out`}
    >
      {options.map((option, i) => {
        return <option key={i}>{option.replace(/_/g, " ")}</option>;
      })}
    </select>
  );
};

export default Selection;
