import { addDoc, collection } from "firebase/firestore";
import { uploadBytes } from "firebase/storage";
import Image from "next/image";
import React, { useRef, useState, type MutableRefObject } from "react";
import type { AnnouncementType } from "shared/types";
import { useDate } from "~/contexts/DateContext";
import { db, intToStringTwoChar, storageRef } from "~/utils/firebase";
import { imageDimension } from "~/utils/image";
import Button from "../Button";

type InputRef = MutableRefObject<HTMLInputElement | null>;
type FileState = File | null;
type SetFile = React.Dispatch<React.SetStateAction<FileState>>;

interface CustomUploadButtonType {
  inputRef: InputRef;
  setFile: SetFile;
}

const PostForm = () => {
  const [file, setFile] = useState<FileState>(null);
  const { selectedDateArray, announceNameRef, year, month } = useDate();
  const inputRef: InputRef = useRef(null);

  async function uploadImage(image: File) {
    try {
      const { metadata } = await uploadBytes(storageRef("images"), image);
      return metadata.name;
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSubmit(event: React.MouseEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const form: HTMLFormElement = event.currentTarget;
      const textarea = form.querySelector("textarea");
      const markedDates = selectedDateArray.map(
        (value) =>
          `${year}-${intToStringTwoChar(month + 1)}-${intToStringTwoChar(
            value
          )}`
      );

      if (file !== null) {
        const photoUrl = await uploadImage(file);
        const announcement: AnnouncementType = {
          message: textarea?.value ?? "",
          photoUrl: photoUrl ?? "",
          state: "unpinned",
          department: "cite",
          dateCreated: new Date().getTime(),
          markedDates,
        };
        await addDoc(collection(db, announceNameRef), announcement);
      }
      setFile(null);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <form
      method="post"
      encType="multipart/form-data"
      onSubmit={(e: React.MouseEvent<HTMLFormElement>) => {
        void handleSubmit(e);
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
        <textarea
          required
          className="w-full rounded-xl p-4 pb-16"
          placeholder="What's happening in our campus?"
        />
        <div className="absolute bottom-0 right-0 flex">
          {/* <Button type="button" text="emoji" id="emoji" /> */}
          <CustomUploadButton {...{ inputRef, setFile }} />
        </div>
      </div>
      <Button type="submit" text="Post" primary rounded />
    </form>
  );
};

const CustomUploadButton = (props: CustomUploadButtonType) => {
  const { inputRef, setFile } = props;

  function handleFilePick() {
    try {
      const fileHolder = inputRef.current?.files?.[0];
      if (fileHolder !== undefined) {
        setFile(fileHolder);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="relative flex overflow-hidden rounded-xl bg-blue-400 px-4 text-white">
      <label className="absolute inset-0 m-auto w-max translate-y-1/4 self-center text-center text-xs">
        Choose File
      </label>
      <input
        ref={inputRef}
        type="file"
        required
        className="h-6 w-16 scale-150 self-center opacity-0"
        accept=".jpg, .jpeg, .png"
        onChange={handleFilePick}
      />
    </div>
  );
};

export default PostForm;
