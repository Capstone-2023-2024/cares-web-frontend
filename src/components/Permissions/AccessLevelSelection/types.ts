import type { ChangeEvent } from "react";
import type { BaseRoleProps } from "@cares/types/permission";

export interface AccessLevelProps extends BaseRoleProps {
  handleAccessLevelSelection: (
    e: ChangeEvent<HTMLSelectElement>,
    id?: string,
  ) => void;
}
