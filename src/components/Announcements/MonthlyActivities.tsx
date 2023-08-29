import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { AnnouncementType } from "shared/types";
import { db } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";
import Button from "../Button";

interface MonthlyActivitiesValuesType {
  data: AnnouncementType[];
  isEditing?: boolean;
}

const MonthlyActivities = () => {
  const [values, setValues] = useState<MonthlyActivitiesValuesType>();

  function toggleEdit() {
    setValues((prevState) => {
      let placeholder: MonthlyActivitiesValuesType;
      if (prevState) {
        placeholder = {
          data: prevState.data,
          isEditing: !prevState.isEditing,
        };
        return placeholder;
      }
    });
  }

  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
    docId: string
  ) {
    event.preventDefault();
    await deleteDoc(doc(db, `announcements/${docId}`));
  }

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "announcements"), orderBy("dateCreated")),
        (snapshot) => {
          const placeholder: AnnouncementType[] = [];
          snapshot.docs.forEach((doc) => {
            placeholder.push({
              ...doc.data(),
              docId: doc.id,
            } as AnnouncementType);
          });
          setValues((prevState) => ({
            ...prevState,
            data: placeholder,
          }));
        }
      ),
    []
  );

  return (
    <div>
      <div className="mt-12 flex items-center justify-center">
        <div className="flex gap-2">
          <Button type="button" onClick={toggleEdit}>
            <Image src="/pencil.png" alt="" {...imageDimension(icon)} />
          </Button>
        </div>
      </div>
      <div className="mx-auto flex w-5/6 gap-2 overflow-x-auto rounded-xl bg-black/10 p-4">
        {values?.data?.map(
          ({ dateCreated, message, photoUrl, department, docId }) => {
            const newDate = new Date();
            newDate.setTime(dateCreated);

            return (
              <div
                className="flex w-64 gap-2 rounded-xl bg-primary/70 p-4"
                key={docId}
              >
                <div className="relative">
                  <div className="absolute right-0 top-0 overflow-hidden rounded-full capitalize">
                    <button
                      disabled={!values.isEditing}
                      className={`${
                        values.isEditing
                          ? "bg-red-500 text-white"
                          : "bg-primary text-black/40"
                      } px-1 capitalize duration-300 ease-in-out`}
                      onClick={(e) => {
                        //eslint-disable-next-line @typescript-eslint/no-floating-promises
                        handleDelete(e, docId ? docId : "");
                      }}
                    >
                      del
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      src="/CICS.png"
                      alt=""
                      {...imageDimension(icon * 2)}
                    />
                    <h2 className="flex flex-col text-center font-bold uppercase">
                      <span>{department}</span>department
                    </h2>
                  </div>
                  <p className="flex flex-col p-2">
                    {message}
                    <span className="absolute inset-x-0 bottom-0 text-xs">{`Date Created: ${newDate.toLocaleString()}`}</span>
                  </p>
                </div>
                {photoUrl ? (
                  <Image src={photoUrl} alt="" {...imageDimension(80)} />
                ) : (
                  <div className="h-32 w-32  rounded-xl bg-primary"></div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default MonthlyActivities;
