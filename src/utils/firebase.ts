import { initializeApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref } from "firebase/storage";
import type { CollectionPathType } from "@cares/types/firebase";

const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIRESTORE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIRESTORE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIRESTORE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIRESTORE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIRESTORE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIRESTORE_MEASUREMENT_ID,
});

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

export const storageRef = (path: "images", name: string) =>
  ref(storage, `${path}/${name}`);

export function intToStringTwoChar(integer: number) {
  return integer > 9 ? `${integer}` : `0${integer}`;
}

export function retrieveImageFBStorage(photoUrl: string) {
  const BASE = "https://firebasestorage.googleapis.com";
  const BASE_DIVIDER = "/v0/b/";
  const STORAGE_BUCKET = "cics-a78de.appspot.com";
  const PATH_DIVIDER = "/o/";
  const PARAMS = "?alt=media";
  const PATH = photoUrl.replace(/\//g, "%2F");
  return `${BASE}${BASE_DIVIDER}${STORAGE_BUCKET}${PATH_DIVIDER}images%2F${PATH}${PARAMS}`;
}

export const validateEmail = (email: string) => {
  const bulsuRegex = /^[a-z]+(\.[a-z]+)*@bulsu\.edu\.ph$/;
  return bulsuRegex.test(email);
};

export const collectionRef = (path: CollectionPathType) => collection(db, path);
