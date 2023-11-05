import type { ReactNode } from "react";
import type { FirestoreDatabaseProps } from "~/types/firebase";

export interface InitialProps {
  people: Omit<PeopleProps, "id">[];
  registered: Omit<RegisteredPeopleProps, "id">[];
}
export type StateType = InitialProps["people"] | InitialProps["registered"];
export interface PeopleProps extends FirestoreDatabaseProps {
  dateUpdated: number;
}

export interface ChatContextProps extends InitialProps {
  arbitrary?: () => Promise<void>;
}

export interface ChatProviderProps {
  children: ReactNode;
}

export interface RegisteredPeopleProps extends FirestoreDatabaseProps {
  displayName: string;
  email: string;
  photoUrl: string;
}
