import type { User } from "firebase/auth"
import type { ReactNode } from "react"

interface InitialProps {
  currentUser: User | null
  typeOfAccount:
    | "super_admin"
    | "partial_super_admin"
    | "program_chair"
    | "admin"
    | "organization_president"
    | "board_member"
    | "sub_admin"
    | null
  loading: boolean
}
type InitialPropsType =
  | InitialProps["currentUser"]
  | InitialProps["typeOfAccount"]
  | InitialProps["loading"]

interface EmailPasswordProps {
  email: string
  password: string
}
interface AuthContextProps extends InitialProps {
  signout: () => Promise<void>
  emailAndPassSignin: (
    props: EmailPasswordProps
  ) => Promise<"SUCCESS" | "ERROR">
  signInWithGoogle: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

export type {
  InitialProps,
  InitialPropsType,
  EmailPasswordProps,
  AuthContextProps,
  AuthProviderProps,
}
