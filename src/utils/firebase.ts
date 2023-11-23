import type { CollectionPathType } from "@cares/types/firebase";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { env } from "~/env.mjs";

const firebaseApp = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIRESTORE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIRESTORE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIRESTORE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIRESTORE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIRESTORE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIRESTORE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIRESTORE_MEASUREMENT_ID,
});

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

function storageRef(path: "images", name: string) {
  return ref(storage, `${path}/${name}`);
}
function getCollection(path: CollectionPathType) {
  return collection(db, path);
}

export { auth, db, getCollection, storage, storageRef };
