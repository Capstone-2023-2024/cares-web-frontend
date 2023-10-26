import type { ChangeEvent } from "react";
import type { BaseRoleProps } from "~/utils/roles/types";

export interface RoleSelectionProps extends BaseRoleProps {
  handleRoleSelection: (e: ChangeEvent<HTMLSelectElement>, id?: string) => void;
}
