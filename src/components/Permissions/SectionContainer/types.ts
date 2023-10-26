import type { ReactNode } from "react";

export interface SectionContainerProps {
  children: ReactNode;
  extensionName: string;
}
export interface SectionContainerStateProps {
  toggleContainer: boolean;
}

export type SectionContainerStateValue =
  SectionContainerStateProps["toggleContainer"];
