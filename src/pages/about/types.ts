import type { ReactNode } from "react";

export interface AboutType {
  summary: string;
  vision: string;
  mission: string;
}

export interface ParagraphType {
  content: string;
  keyName: "summary" | "vision" | "mission";
}

export interface ParagaphValuesType {
  content: string;
  isEditing: boolean;
}

export interface ContainerType {
  children: ReactNode;
  bg?: string;
}
