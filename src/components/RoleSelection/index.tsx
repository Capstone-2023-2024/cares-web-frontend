import { roleOptions } from "@cares/utils/admin";
import type { RoleSelectionProps } from "./types";

const RoleSelection = ({
  role,
  handleRoleSelection,
  ...rest
}: RoleSelectionProps) => {
  function disabledStyle() {
    return rest.disabled
      ? "appearance-none bg-transparent"
      : "border border-gray-300";
  }

  return (
    <div>
      <select
        required
        {...rest}
        value={role.name}
        className={`${disabledStyle()} w-40 rounded-xl p-2 capitalize duration-300 ease-in-out`}
        onChange={handleRoleSelection}
      >
        {roleOptions.map(({ name }) => {
          return (
            <option key={name} value={name}>
              {name.replace(/_/g, " ")}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default RoleSelection;
