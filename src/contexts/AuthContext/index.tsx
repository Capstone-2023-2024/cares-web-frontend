import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import accounts from "~/pages/api/authentication/accounts";
import { auth } from "~/utils/firebase";
import type {
  AuthContextProps,
  AuthProviderProps,
  EmailPasswordProps,
  InitialProps,
  InitialPropsType,
} from "./types";

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
  signInWithGoogle: async () => {},
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
  async function signInWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const superAdmin = "admin@cares.com";
    const bm = "bm@cares.com";
    const unsub = onAuthStateChanged(auth, (user) => {
      handleState("loading", true);
      handleState("currentUser", user);
      async function extractAccounts() {
        if (user !== null && user.email !== null) {
          try {
            switch (user.email) {
              case superAdmin:
                return handleState("typeOfAccount", "super_admin");
              case bm:
                return handleState("typeOfAccount", "board_member");
              default:
                break;
            }
            const data = await accounts(user.email);
            if (data !== null) {
              const { name, partial } = data.role.access_level;
              switch (name) {
                case "super_admin":
                  return handleState(
                    "typeOfAccount",
                    partial ? "partial_super_admin" : "super_admin"
                  );
                case "admin":
                  return handleState(
                    "typeOfAccount",
                    partial ? "admin" : "program_chair"
                  );
                case "sub_admin":
                  return handleState(
                    "typeOfAccount",
                    partial ? "organization_president" : "board_member"
                  );
                // case "faculty":
                //   return handleState("typeOfAccount", null);
                default:
                  return handleState("typeOfAccount", null);
              }
            }
          } catch (err) {
            handleState("typeOfAccount", null);
          }
        }
      }
      void extractAccounts();
      handleState("loading", false);
    });
    return unsub;
  }, [accounts]);

  return (
    <AuthContext.Provider
      value={{ ...state, signout, emailAndPassSignin, signInWithGoogle }}
    >
      {state.loading ? <p>Loading</p> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
