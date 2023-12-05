import type {
  DateFileProps,
  FirestoreDatabaseProps,
} from "@cares/common/types/document";
import type { RoleProps } from "@cares/common/types/permission";

export interface PermissionProps extends FirestoreDatabaseProps {
  email: string;
  role: RoleProps;
}

export interface PermissionWithDateProps
  extends PermissionProps,
    DateFileProps {}
