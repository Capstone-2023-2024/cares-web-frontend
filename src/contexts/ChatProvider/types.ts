import type { ReactNode } from "react"
import type { FirestoreDatabaseProps } from "@cares/types/document"

interface InitialProps {
  people: Omit<PeopleProps, "id">[]
  registered: Omit<RegisteredPeopleProps, "id">[]
}
type StateType = InitialProps["people"] | InitialProps["registered"]
interface PeopleProps extends FirestoreDatabaseProps {
  dateUpdated: number
}

interface ChatContextProps extends InitialProps {
  arbitrary?: () => Promise<void>
}

interface ChatProviderProps {
  children: ReactNode
}

interface RegisteredPeopleProps extends FirestoreDatabaseProps {
  displayName: string
  email: string
  photoUrl: string
}

export type {
  InitialProps,
  StateType,
  PeopleProps,
  ChatContextProps,
  ChatProviderProps,
  RegisteredPeopleProps,
}
