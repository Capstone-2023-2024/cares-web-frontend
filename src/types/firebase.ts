import { collection } from "firebase/firestore";
import { db } from "~/utils/firebase";

export interface FirestoreDatabaseProps {
  id: string;
}

export interface DateFileProps {
  dateCreated: number;
  dateEdited: number | null;
}

export type CollectionPath = "complaints" | "student" | "mayor" | "advisers";

export const collectionRef = (path: CollectionPath) => collection(db, path);
