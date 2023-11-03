import type { ReactNode } from "react";
import type { UserCredential, User } from "firebase/auth";

export interface InitialProps {
  currentUser: User | null;
  typeOfAccount:
    | "super_admin"
    | "partial_super_admin"
    | "program_chair"
    | "admin"
    | "organization_president"
    | "board_member"
    | "sub_admin"
    | null;
  loading: boolean;
}
export type InitialPropsType =
  | InitialProps["currentUser"]
  | InitialProps["typeOfAccount"]
  | InitialProps["loading"];

export interface EmailPasswordProps {
  email: string;
  password: string;
}
export interface AuthContextProps extends InitialProps {
  signout: () => Promise<void>;
  emailAndPassSignin: (
    props: EmailPasswordProps
  ) => Promise<"SUCCESS" | "ERROR">;
  signInWithGoogle: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
