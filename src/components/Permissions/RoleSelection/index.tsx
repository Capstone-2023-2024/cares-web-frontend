import { roleOptions } from "~/utils/roles";
import type { RoleSelectionProps } from "./types";

const RoleSelection = ({
  role,
  handleRoleSelection,
  ...rest
}: RoleSelectionProps) => {
  function disabledStyle() {
    return rest.disabled
      ? "appearance-none bg-transparent"
      : "bg-primary text-paper";
  }

  return (
    <div>
      <select
        required
        {...rest}
        value={role.title}
        className={`${disabledStyle()} w-32 rounded-xl p-2 capitalize duration-300 ease-in-out`}
        onChange={handleRoleSelection}
      >
        {roleOptions.map(({ title, access_level }) => {
          return (
            <option key={title} value={title}>
              {access_level.name.replace(/_/g, " ")}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default RoleSelection;
