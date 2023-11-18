import type { PermissionWithDateProps } from "~/components/Permissions/RoleModal/types";
import type { StudentWithClassSection } from "~/types/student";
import type { RoleProps } from "~/utils/roles/types";

export interface AssignAdminProps {
  permissionArray: PermissionWithDateProps[];
  toggleEdit: string;
}
export type AssignAdminPropsValue =
  | AssignAdminProps["permissionArray"]
  | AssignAdminProps["toggleEdit"];

export interface RoleModalProps {
  email: string;
  role: RoleProps;
}
//eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type RoleModalPropsValue =
  | RoleModalProps["role"]
  | RoleModalProps["email"];

export interface DataSelectionProps {
  yearLevel: string;
  section: "a" | "b" | "c" | "d" | "e" | "f" | "g";
}

export interface MayorProps extends DataSelectionProps {
  id: string;
  studentNo: string;
  name: string;
  email: string;
  dateCreated: number;
}
export interface AdviserProps extends DataSelectionProps {
  id: string;
  name: string;
  email: string;
  dateCreated: number;
}

export interface FacultyProps {
  id: string;
  email: string;
  name: string;
}

export interface AssignAdviserStateProps extends DataSelectionProps {
  adviser: AdviserProps[];
  faculty: FacultyProps[];
  selectedFaculty: string | null;
}

export interface AssignMayorStateProps {
  yearLevel: string;
  section: string;
  mayors: MayorProps[];
  selectedMayor: string | null;
  studentsWithSection: StudentWithClassSection[];
}
