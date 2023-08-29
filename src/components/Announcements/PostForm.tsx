import { addDoc, collection } from "firebase/firestore";
import Image from "next/image";
import React, { useState } from "react";
import { AnnouncementType } from "shared/types";
import { db } from "~/utils/firebase";
import { imageDimension } from "~/utils/image";
import Button from "../Button";

const PostForm = () => {
  const [srcClicked, setSrcClick] = useState(false);

  async function handleSubmit(event: React.MouseEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const form: HTMLFormElement = event.currentTarget;
      const input = form.querySelector("input");
      const url =
        "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3V0ZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80";

      const announcement: AnnouncementType = {
        message: input?.value ?? "",
        photoUrl: srcClicked ? url : "",
        state: "unpinned",
        department: "cite",
        dateCreated: new Date().getTime(),
      };

      await addDoc(collection(db, "announcements"), announcement);
    } catch (err) {
      console.log(err);
    }
  }

  function handleImgSrc(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setSrcClick((p) => !p);
  }

  return (
    <form
      onSubmit={(e: React.MouseEvent<HTMLFormElement>) => {
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

export default PostForm;
