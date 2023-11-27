import type { AccessLevelProps } from "./types";

const AccessLevelSelection = ({
  role,
  handleAccessLevelSelection,
  ...rest
}: AccessLevelProps) => {
  const selectionConditionalStyle = `${disabledStyle()}`;

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
        onMouseOver={(e) => {
          console.log(e.target);
        }}
      >
        <option className="text-yellow-500" value={String(true)}>
          {String(true)}
        </option>
        <option className="text-blue-500" value={String(false)}>
          {String(false)}
        </option>
      </select>
    </div>
  );
};

export default AccessLevelSelection;
