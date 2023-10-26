import type { SelectionProps } from "./types";

const Selection = ({ array, ...rest }: SelectionProps) => {
  return (
    <select required {...rest} className="w-48 p-2 capitalize">
      {array.map((value) => {
        return <option key={value}>{value}</option>;
      })}
    </select>
  );
};

export default Selection;
