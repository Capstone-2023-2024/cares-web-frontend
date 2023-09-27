import type { ReactNode } from "react";
import type { UserCredential, User } from "firebase/auth";

export interface InitialProps {
  currentUser: User | null;
  loading: boolean;
}

export interface AuthContextProps extends InitialProps {
  signout: () => Promise<void>;
  emailAndPassSignin: (props: {
    email: string;
    password: string;
  }) => Promise<"SUCCESS" | "ERROR">;
}

export interface AuthProviderProps {
  children: ReactNode;
}
