import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../utils/firebase";
import type {
  AuthContextProps,
  AuthProviderProps,
  EmailPasswordProps,
  InitialProps,
  InitialPropsType,
} from "./types";

export interface ResponseData {
  bm: string;
  admin: string;
  superAdmin: string;
}

// async function handler(email: string) {
//   interface HandlerProps
//     extends Partial<PermissionProps>,
//       Partial<FirestoreDatabaseProps> {}
//   const permColRef = collection(db, "permission");
//   const emailQuery = query(permColRef, where("email", "==", email));
//   const countFromServer = await getCountFromServer(emailQuery);
//   const count = countFromServer.data().count;
//   console.log({ count });

//   if (count < 1) {
//     return null;
//   }
//   let handler: HandlerProps = {};
//   const snapshot = await getDocs(emailQuery);
//   snapshot.forEach((doc) => {
//     const data = doc.data();
//     const id = doc.id;
//     handler = { ...data, id };
//   });
//   return handler as PermissionProps;
// }

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
  signInWithGoogle: async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.log(err);
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
      function extractAccounts() {
        if (user !== null) {
          try {
            switch (user.email) {
              case superAdmin:
                return handleState("typeOfAccount", "super_admin");
              case bm:
                return handleState("typeOfAccount", "board_member");
              default:
                break;
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
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signout, emailAndPassSignin, signInWithGoogle }}
    >
      {state.loading ? state.loading : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
