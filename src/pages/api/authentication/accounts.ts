// import type { NextApiRequest, NextApiResponse } from "next";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { PermissionWithDateProps } from "~/components/Permissions/RoleModal/types";
import { db } from "~/utils/firebase";

export default async function handler(email: string) {
  // req: NextApiRequest,
  // res: NextApiResponse<ResponseData>
  const permColRef = collection(db, "permission");
  const emailQuery = query(permColRef, where("email", "==", email));
  const countFromServer = await getCountFromServer(emailQuery);
  const count = countFromServer.data().count;
  console.log({ count });

  if (count < 1) {
    return null;
  }
  let handler: Partial<PermissionWithDateProps> = {};
  const snapshot = await getDocs(emailQuery);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    handler = { ...data, id };
  });
  return handler as PermissionWithDateProps;
}
