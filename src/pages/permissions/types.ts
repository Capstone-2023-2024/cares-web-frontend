import type { ChangeEvent } from "react";

export interface FirebaseDocument {
  id: string;
}

export interface PermissionProps extends FirebaseDocument {
  email: string;
  role: "admin_1" | "admin_2" | "admin_3" | "faculty";
}

export interface PermissionWithDateProps extends PermissionProps {
  dateAdded: number;
  dateModified: number | null;
}
export interface HomeStateProps {
  permissionArray: PermissionWithDateProps[];
  isEditEnabled: boolean;
  deleteModal: boolean;
  deleteConfirmation: string;
}
export type HomeStatePropsType =
  | HomeStateProps["permissionArray"]
  | HomeStateProps["isEditEnabled"];

export type RoleType = Pick<PermissionProps, "role">["role"];
export interface RoleModalProps {
  email: string;
  role: RoleType;
}
//eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type RoleModalPropsType =
  | RoleModalProps["role"]
  | RoleModalProps["email"];

export interface RoleSelectionProps {
  role: RoleType;
  disabled?: boolean;
  handleSelection: (e: ChangeEvent<HTMLSelectElement>, id?: string) => void;
}

export interface AddRoleProps {
  isModalShowing: boolean;
}
export type AddRoleValueType = AddRoleProps["isModalShowing"];
