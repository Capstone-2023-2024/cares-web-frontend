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
  InitialProps,
} from "./types";

const PROMISECONDITION = true;
const initialProps: InitialProps = {
  currentUser: null,
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

  function handleState(
    key: keyof InitialProps,
    value: InitialProps["currentUser"] | InitialProps["loading"]
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  async function signout() {
    try {
      return await signOut(auth);
    } catch (e) {
      console.log(e);
    }
  }

  async function emailAndPassSignin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return "SUCCESS";
    } catch (err) {
      return "ERROR";
    }
  }

  // async function googleSignin() {
  //   try {
  //     const credentials = await signInWithPopup(auth, GOOGLEPROVIDER);
  //     const { displayName, email, photoURL } = credentials.user;
  //     const regColRef = collection(db, "registered");
  //     const regQuery = query(regColRef, where("email", "==", email));
  //     const snapshot = await getDocs(regQuery);
  //     if (snapshot.empty) {
  //       void (await addDoc(regColRef, { email, displayName, photoURL }));
  //     }
  //     return credentials;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      handleState("loading", true);
      handleState("currentUser", user);
      handleState("loading", false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signout, emailAndPassSignin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
