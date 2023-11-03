import type { DocumentData } from "firebase/firestore";
import type { ConcernProps } from "~/types/complaints";
import type { StudentWithSectionProps } from "~/types/student";

export interface ChatTextProps {
  text: string;
  condition: boolean;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

export interface RawDocProps {
  id: string;
  data: () => DocumentData;
  _key: { path: { segments: string[] } };
}

export interface TicketInfoProps {
  id: string;
  title: string;
  about: string;
  dateCreated: number;
  dateUpdated?: number;
  status: "pending" | "turnOvered" | "resolved" | "rejected";
}

export interface TicketInfoExtended extends TicketInfoProps {
  studentNumber: string;
}

export interface ComplaintsStateProps {
  students: StudentWithSectionProps[];
  concerns: ConcernProps[];
  message: string;
  collectionReference: string | null;
}

export type ComplaintsStateValues =
  | ComplaintsStateProps["students"]
  | ComplaintsStateProps["concerns"]
  | ComplaintsStateProps["message"]
  | ComplaintsStateProps["collectionReference"];
