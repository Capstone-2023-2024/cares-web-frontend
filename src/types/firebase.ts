export interface FirestoreDatabaseProps {
  id: string
}

export interface DateFileProps {
  dateCreated: number
  dateEdited: number | null
}

export type CollectionPath =
  | "chat"
  | "announcement"
  | "about"
  | "student"
  | "faculty"
