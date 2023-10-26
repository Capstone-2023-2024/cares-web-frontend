import type { ReactNode } from "react";

export interface AddRoleProps {
  isModalShowing: boolean;
}
export type AddRoleValue = AddRoleProps["isModalShowing"];

export interface AddUserProps {
  children: ReactNode;
}
