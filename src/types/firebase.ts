export interface FirestoreDatabaseProps {
  id: string;
}

export interface DateFileProps {
  dateCreated: number;
  dateEdited: number | null;
}

export type CollectionPath =
  | "about"
  | "advisers"
  | "announcement"
  | "chat"
  | "concerns"
  | "faculty"
  | "mayor"
  | "permission"
  | "project_suggestion"
  | "student";
