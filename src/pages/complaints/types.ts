import type { DocumentData } from "firebase/firestore";

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
