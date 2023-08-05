import { addDoc, collection } from "firebase/firestore";
import Image from "next/image";
import { type MouseEvent } from "react";
import Button from "~/components/Button";
import Main from "~/components/Main";
import { db } from "~/utils/firebase";
import { imageDimension } from "~/utils/image";

interface AnnouncementsPropType {
  message: string;
  bannerSrc?: string;
  state?: "unpin" | "pin";
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
  async function handleSubmit(event: MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    const promise = await Promise.resolve();
    const form: HTMLFormElement = event.currentTarget;
    const input = form.querySelector("input");
    const announcement: AnnouncementsPropType = { message: input?.value ?? "" };
    if (input?.value) {
      await addDoc(collection(db, "announcements"), announcement);
      return promise;
    }
    alert("Empty message");
    return promise;
  }
  return (
    <form
      onSubmit={handleSubmit}
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
          className="w-full rounded-xl p-4 pb-16"
          placeholder="What's happening in our campus?"
        />
        <div className="absolute bottom-0 right-0 flex">
          <Button type="button" text="emoji" />
          <Button type="button" text="imgup" />
        </div>
      </div>
      <Button text="Post" primary rounded />
    </form>
  );
};

const Month = () => {
  const newDate = new Date();
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    " july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return (
    <div>
      <div className="flex items-center justify-center">
        <h2 className="flex-1 capitalize">{`Month of ${
          months[newDate.getMonth()]
        }`}</h2>
        <div className="flex gap-2">
          <Button type="button" text="edit" />
          <Button type="button" text="del" />
        </div>
      </div>
    </div>
  );
};

export default Announcements;
