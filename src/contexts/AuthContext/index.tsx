import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "~/utils/firebase";
import type {
  AuthContextProps,
  AuthProviderProps,
  EmailPasswordProps,
  InitialProps,
  InitialPropsType,
} from "./types";
import accounts from "~/pages/api/authentication/accounts";
import { ResponseData } from "~/pages/api/authentication/types";

const PROMISECONDITION = true;
const initialProps: InitialProps = {
  currentUser: null,
  typeOfAccount: null,
  loading: true,
};
const AuthContext = createContext<AuthContextProps>({
  ...initialProps,
  signout: async () => {
    return new Promise<void>((resolve, reject) => {
      if (PROMISECONDITION) return resolve;
      return reject;
    });
  },
  emailAndPassSignin: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return "SUCCESS";
    } catch (e) {
      return "ERROR";
    }
  },
});

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState(initialProps);

  function handleState(key: keyof InitialProps, value: InitialPropsType) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  async function signout() {
    try {
      return await signOut(auth);
    } catch (err) {
      console.log(err);
    }
  }

  async function emailAndPassSignin({ email, password }: EmailPasswordProps) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return "SUCCESS";
    } catch (err) {
      return "ERROR";
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      handleState("loading", true);
      handleState("currentUser", user);
      if (user !== null) {
        const extractAccounts = async () => {
          const account = await accounts();
          return account;
        };
        extractAccounts();
        const isEmailBM = user.email === "bm@cares.com";
        handleState("typeOfAccount", isEmailBM ? "bm" : "admin");
      }
      handleState("loading", false);
    });
    return () => unsub();
  }, [accounts]);

  return (
    <AuthContext.Provider value={{ ...state, signout, emailAndPassSignin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
