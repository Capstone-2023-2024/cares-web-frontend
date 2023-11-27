import type { SelectionProps } from "./type";

const Selection = ({ options, ...rest }: SelectionProps<string>) => {
  return (
    <select
      {...rest}
      className="w-full min-w-max rounded-lg bg-primary p-2 capitalize text-paper"
    >
      {options.map((option, i) => {
        return <option key={i}>{option.replace(/_/g, " ")}</option>;
      })}
    </select>
  );
};

export default Selection;
