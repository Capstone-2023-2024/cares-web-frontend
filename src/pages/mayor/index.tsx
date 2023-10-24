import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Main from "~/components/Main";
import { db } from "~/utils/firebase";
import type { MayorProps } from "./types";
import ActionButton from "~/components/Actionbutton";

const Mayor = () => {
  const [state, setState] = useState<MayorProps[]>([]);
  const mayorRef = collection(db, "mayor");

  async function handleApprove(id: string) {
    const update = "active" as Pick<MayorProps, "status">;
    try {
      await updateDoc(doc(mayorRef, id), { status: update });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await deleteDoc(doc(mayorRef, id));
    } catch (err) {
      console.log(err);
    }
  }

  function renderMayors() {
    return state.map(({ id, name, section, yearLevel, status }) => {
      return (
        <tr key={id} className="border p-2">
          <td className="border p-2">
            <p>{name}</p>
          </td>
          <td className="border p-2">
            <p>{yearLevel}</p>
          </td>
          <td className="border p-2 capitalize">
            <p>{section}</p>
          </td>
          <td
            className={`${
              status === undefined ? "text-yellow-700" : "text-green-500"
            } capitalize`}
          >
            {status === undefined ? "pending" : status}
          </td>
          <td className="flex gap-2">
            <ActionButton
              onClick={() => handleApprove(id)}
              text="approve"
              disabled={status !== undefined}
              color={status !== undefined ? "default" : "green"}
            />
            <ActionButton
              onClick={() => handleRevoke(id)}
              text="revoke"
              color="red"
            />
          </td>
        </tr>
      );
    });
  }

  useEffect(() => {
    onSnapshot(query(mayorRef), (snapshot) => {
      const placeholder: MayorProps[] = [];
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<MayorProps, "id">;
          const id = doc.id;
          placeholder.push({ ...data, id });
        });
      }
      setState(placeholder);
    });
  }, [mayorRef]);

  return (
    <Main>
      <section>
        <table className="border p-2">
          <thead className="capitalize">
            <tr className="border p-2">
              <th className="border p-2">
                <p>name</p>
              </th>
              <th className="border p-2">
                <p>year level</p>
              </th>
              <th className="border p-2">
                <p>section</p>
              </th>
              <th className="border p-2">
                <p>status</p>
              </th>
              <th className="border p-2">
                <p>action</p>
              </th>
            </tr>
          </thead>
          <tbody>{renderMayors()}</tbody>
        </table>
      </section>
    </Main>
  );
};

export default Mayor;
