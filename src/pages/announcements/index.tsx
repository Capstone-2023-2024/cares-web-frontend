import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import Image from "next/image";
import { useState, type MouseEvent, useEffect } from "react";
import Button from "~/components/Button";
import Main from "~/components/Main";
import { months } from "~/utils/date";
import { db } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";

interface AnnouncementsPropType {
  docId?: string;
  message: string;
  bannerSrc?: string;
  department: "cite";
  state?: "unpin" | "pin";
  dateCreated: number;
  dateEdited?: number;
}

interface MonthValuesType {
  data: AnnouncementsPropType[];
  isEditing?: boolean;
}

const Announcements = () => {
  return (
    <Main>
      <div className="grid">
        <Form />
        <Month />
      </div>
    </Main>
  );
};

const Form = () => {
  const [srcClicked, setSrcClick] = useState(false);

  async function handleSubmit(event: MouseEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const form: HTMLFormElement = event.currentTarget;
      const input = form.querySelector("input");
      const url =
        "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3V0ZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80";

      const announcement: AnnouncementsPropType = {
        message: input?.value ?? "",
        bannerSrc: srcClicked ? url : "",
        state: "pin",
        department: "cite",
        dateCreated: new Date().getTime(),
      };

      await addDoc(collection(db, "announcements"), announcement);
    } catch (err) {
      console.log(err);
    }
  }

  function handleImgSrc(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setSrcClick((p) => !p);
  }

  return (
    <form
      onSubmit={(e: MouseEvent<HTMLFormElement>) => {
        //eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleSubmit(e);
      }}
      className="mx-auto my-10 flex w-3/4 flex-col items-center justify-center gap-2 rounded-xl bg-primary/50 py-4"
    >
      <h2 className="text-xl">Create Post</h2>
      <p className="flex items-center gap-2 font-semibold uppercase">
        <span>
          <Image src="/CICS.png" {...imageDimension(40)} alt="" />
        </span>
        CITE Department
      </p>
      <div className="relative w-3/4">
        <input
          required
          className="w-full rounded-xl p-4 pb-16"
          placeholder="What's happening in our campus?"
        />
        <div className="absolute bottom-0 right-0 flex">
          <Button type="button" text="emoji" id="emoji" />
          <Button type="button" text="imgup" onClick={(e) => handleImgSrc(e)} />
        </div>
      </div>
      <Button text="Post" primary rounded />
    </form>
  );
};

const Month = () => {
  const [values, setValues] = useState<MonthValuesType>();

  function toggleEdit() {
    setValues((prevState) => {
      let placeholder: MonthValuesType;
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
    event: MouseEvent<HTMLButtonElement>,
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
          const placeholder: AnnouncementsPropType[] = [];
          snapshot.docs.forEach((doc) => {
            placeholder.push({
              ...doc.data(),
              docId: doc.id,
            } as AnnouncementsPropType);
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
      <div className="flex items-center justify-center">
        <h2 className="flex-1 capitalize">{`Month of ${
          months[new Date().getMonth()]
        }`}</h2>
        <div className="flex gap-2">
          <Button type="button" onClick={toggleEdit}>
            <Image src="/pencil.png" alt="" {...imageDimension(icon)} />
          </Button>
        </div>
      </div>
      <div className="mx-auto flex w-5/6 gap-2 overflow-x-auto rounded-xl bg-black/10 p-4">
        {values?.data?.map(
          ({ dateCreated, message, bannerSrc, department, docId }) => {
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
                {bannerSrc ? (
                  <Image src={bannerSrc} alt="" {...imageDimension(80)} />
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

export default Announcements;
