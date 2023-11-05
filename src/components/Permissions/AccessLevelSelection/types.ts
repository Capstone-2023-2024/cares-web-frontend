import type { ChangeEvent } from "react";
import type { BaseRoleProps } from "~/utils/roles/types";

export interface AccessLevelProps extends BaseRoleProps {
  handleAccessLevelSelection: (
    e: ChangeEvent<HTMLSelectElement>,
    id?: string
  ) => void;
}
