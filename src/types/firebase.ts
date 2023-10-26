export interface FirestoreDatabaseProps {
  id: string;
}

export interface DateFileProps {
  dateCreated: number;
  dateEdited?: number;
}

export type CollectionPath =
  | "chat"
  | "announcement"
  | "about"
  | "student"
  | "faculty";
