import React, {
  type ReactNode,
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  type User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "~/utils/firebase";

interface AuthContextType {
  currentUser: User | null;
  signout: () => Promise<void>;
  googleSignin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  signout: async () => new Promise((resolver) => resolver(void null)),
  googleSignin: async () => new Promise((resolver) => resolver(void null)),
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  async function signout() {
    await signOut(auth);
  }
  async function googleSignin() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        }
      }),
    []
  );

  const values = {
    currentUser,
    signout,
    googleSignin,
  };
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
