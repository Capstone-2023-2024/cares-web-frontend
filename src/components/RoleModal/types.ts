import type {
  DateFileProps,
  FirestoreDatabaseProps,
} from "@cares/types/document";
import type { RoleProps } from "@cares/types/permission";

export interface PermissionProps extends FirestoreDatabaseProps {
  email: string;
  role: RoleProps;
}

export interface PermissionWithDateProps
  extends PermissionProps,
    DateFileProps {}
