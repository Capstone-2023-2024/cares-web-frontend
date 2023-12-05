import type { ChangeEvent } from "react";
import type { BaseRoleProps } from "@cares/common/types/permission";

export interface RoleSelectionProps extends BaseRoleProps {
  handleRoleSelection: (e: ChangeEvent<HTMLSelectElement>, id?: string) => void;
}
