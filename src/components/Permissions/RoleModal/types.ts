import type { FirestoreDatabaseProps } from "~/types/firebase";
import type { RoleProps } from "~/utils/roles/types";

export interface PermissionProps extends FirestoreDatabaseProps {
  email: string;
  role: RoleProps;
}

export interface PermissionWithDateProps extends PermissionProps {
  dateAdded: number;
  roleInString: string;
  dateModified: number | null;
}
