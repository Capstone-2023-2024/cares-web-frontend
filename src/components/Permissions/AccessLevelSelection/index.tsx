import type { AccessLevelProps } from "./types";

const AccessLevelSelection = ({
  role,
  handleAccessLevelSelection,
  ...rest
}: AccessLevelProps) => {
  const selectionConditionalStyle = `${
    String(role.partial) === "true" ? "text-green-500" : "text-red-500"
  } ${disabledStyle()}`;

  function disabledStyle() {
    return rest.disabled ? "appearance-none" : "";
  }

  return (
    <div>
      <select
        required
        {...rest}
        value={String(role.partial)}
        className={`${selectionConditionalStyle} w-40 rounded-xl border border-gray-300 p-2 capitalize duration-300 ease-in-out`}
        onChange={handleAccessLevelSelection}
      >
        <option value={String(true)}>{String(true)}</option>
        <option value={String(false)}>{String(false)}</option>
      </select>
    </div>
  );
};

export default AccessLevelSelection;
