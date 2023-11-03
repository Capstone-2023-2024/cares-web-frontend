import { addDoc, collection } from "firebase/firestore";
import { uploadBytes } from "firebase/storage";
import Image from "next/image";
import React, { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useDate } from "~/contexts/DateContext";
import { useToggle } from "~/contexts/ToggleContext";
import { AnnouncementProps } from "~/types/announcement";
import { db, intToStringTwoChar, storageRef } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";
import Button from "../../Button";
import type { InputRef, PostFormStateProps, PostFormStateValue } from "./types";
import { typesOfAnnouncement } from "~/utils/announcement";
import AnnouncementTypesSelection from "./AnnouncementTypesSelection";

const PostForm = () => {
  const { currentUser } = useAuth();
  const initState: PostFormStateProps = {
    postedBy: currentUser?.email ?? "",
    files: null,
    tag: "",
    tags: [],
    type: typesOfAnnouncement[0]?.type ?? "event",
    message: "",
    state: "unpinned",
    department: "cite",
    dateCreated: new Date().getTime(),
    markedDates: [],
    endDate: 0,
  };
  const [state, setState] = useState(initState);
  const { toggleCalendar } = useToggle();
  const { selectedDateArray, year, month, changeSelectedDateArray } = useDate();
  const inputRef: InputRef = useRef(null);
  const { typeOfAccount } = useAuth();
  const placeholderText =
    state.type === "event"
      ? "What's happening in our campus?"
      : state.type === "recognition"
      ? "Tell the details for the recognition"
      : "Create a summary of the University Memorandum";

  function handleState(
    key: keyof PostFormStateProps,
    value: PostFormStateValue
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }
  function previewImage(file: File, index: number) {
    const oFReader = new FileReader();
    oFReader.readAsDataURL(file);
    oFReader.onload = (oFREvent) => {
      const result = oFREvent.target?.result;
      if (result !== null && result !== undefined) {
        const imageContainer = document.getElementById(
          `image_${index}`
        ) as HTMLImageElement;
        return (imageContainer.src = result as string);
      }
    };
  }
  function getImageArray(files: File[]) {
    for (let x = 0; x < files.length; x++) {
      const currentFile = files[x];
      if (currentFile !== undefined) {
        previewImage(currentFile, x);
      }
    }
  }
  function handleFilePick() {
    try {
      const inRef = inputRef.current;
      if (inRef !== null && inRef.files !== null) {
        getImageArray([...inRef.files]);
        handleState("files", [...inRef.files]);
      }
    } catch (err) {
      console.log(err);
    }
  }
  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    handleState("message", event.target.value);
  }
  function handleRemoveFromArray({
    array,
    name,
    index,
  }: {
    array: any[] | null;
    name: keyof PostFormStateProps;
    index: number;
  }) {
    if (array !== null) {
      const newArray = array.filter((v, i) => index !== i);
      handleState(name, [...newArray]);
    }
  }
  function handleTagChange(event: ChangeEvent<HTMLInputElement>) {
    const invalidChar = "0123456789./;'[]\\/,";
    const length = invalidChar.length;
    const tagLength = event.target.value.length;
    for (let x = 0; x < length; x++) {
      if (event.target.value.charAt(tagLength - 1) === invalidChar[x]) {
        return;
      }
    }
    handleState("tag", event.target.value);
  }
  function handleTagEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key.toLowerCase() === "," && state.tag?.trim() !== "") {
      handleState("tags", [
        ...new Set([...state.tags, state.tag.trim().toLowerCase()]),
      ]);
      handleState("tag", "");
    }
  }
  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    handleState("type", event.target.value);
  }
  async function uploadImage(image: File) {
    try {
      await uploadBytes(storageRef("images", image.name), image);
      return image.name;
    } catch (err) {
      console.log(err);
    }
  }
  async function handleSubmit(event: React.MouseEvent<HTMLFormElement>) {
    if (typeOfAccount !== null) {
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

        if (
          textarea !== null &&
          textarea.value !== null &&
          state.tags.length > 0
        ) {
          const photoUrl: string[] = [];
          state.files?.map(async ({ name, ...rest }) => {
            photoUrl.push(name);
            await uploadImage({ name, ...rest });
          });
          const newDate = new Date();
          const lastMarkedDate = markedDates[markedDates.length - 1];
          const targetCharacter = "-";
          const first = lastMarkedDate?.indexOf(targetCharacter);
          const last = lastMarkedDate?.lastIndexOf(targetCharacter);
          const year = lastMarkedDate?.substring(0, first);
          const month = lastMarkedDate?.substring((first ?? 0) + 1, last);
          const date = lastMarkedDate?.substring((last ?? 0) + 1);

          newDate.setFullYear(JSON.parse(year ?? "0") ?? 0);
          newDate.setMonth(
            (JSON.parse(
              month?.charAt(0) === "0" ? month.substring(1) : month ?? "0"
            ) ?? 0) - 1
          );
          newDate.setDate(
            JSON.parse(
              date?.charAt(0) === "0" ? date.substring(1) : date ?? "0"
            ) ?? 0
          );
          console.log({ date: newDate.getTime() });
          const announcement: Omit<AnnouncementProps, "id"> = {
            postedBy: state.postedBy,
            type: state.type,
            tags: state.tags,
            state: state.state,
            message: textarea.value,
            department: "cite",
            dateCreated: new Date().getTime(),
            endDate: newDate.getTime(),
            markedDates,
          };
          await addDoc(
            collection(db, "announcement"),
            state.files === null
              ? { ...announcement }
              : { ...announcement, photoUrl }
          );

          changeSelectedDateArray([]);
          toggleCalendar();
          return setState(initState);
        }
        return alert("Please enter atleast one tag");
      } catch (err) {
        console.log(err);
        return handleState("files", null);
      }
    }
    alert("You do not have the permission to do this action");
  }
  const renderUploadButton = () => {
    return (
      <div className="relative -right-[22rem] bottom-36 z-10 flex w-max overflow-hidden rounded-xl bg-blue-400/40 px-4 py-2 text-white/40 duration-300 ease-in-out hover:bg-blue-400 hover:text-white">
        <label className="absolute inset-0 m-auto w-max translate-y-1/4 self-center text-center text-xs">
          {state.files !== null && state.files.length > 0
            ? "Add images"
            : "Choose Images"}
        </label>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="h-6 w-16 scale-150 cursor-pointer self-center opacity-0"
          accept=".jpg, .jpeg, .png"
          onChange={handleFilePick}
        />
      </div>
    );
  };
  const renderSelectedImages = () => {
    return (
      <div className="h-fit max-h-32 overflow-x-auto">
        {state.files?.map((value, i) => {
          return (
            <div key={i} className="relative">
              <button
                type="button"
                onClick={() =>
                  handleRemoveFromArray({
                    array: state.files ?? [],
                    name: "files",
                    index: i,
                  })
                }
                className="absolute right-0 top-0 rounded-full bg-primary/70 px-4 py-2 text-paper"
              >
                x
              </button>
              <img
                id={`image_${i}`}
                alt=""
                className="h-auto w-auto"
                {...imageDimension(icon)}
              />
            </div>
          );
        })}
      </div>
    );
  };
  const renderTags = () => (
    <div className="flex flex-row items-center gap-2 text-xs">
      <p className="px-2 py-5 capitalize">tags:</p>
      <div className="flex w-5/6 flex-row gap-2 overflow-x-auto">
        {state.tags.map((v, i) => {
          return (
            <div
              key={i}
              className="relative w-fit gap-2 rounded-lg bg-paper/90 px-6 py-2"
            >
              <button
                type="button"
                onClick={() =>
                  handleRemoveFromArray({
                    array: state.tags,
                    name: "tags",
                    index: i,
                  })
                }
                className="absolute right-0 top-0 rounded-full bg-primary/40 px-2 py-1 text-xs text-paper duration-300 ease-in-out hover:bg-red-500"
              >
                x
              </button>
              <p>{v}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

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
        <AnnouncementTypesSelection
          value={state.type}
          onChange={handleTypeChange}
        />
        <textarea
          required
          value={state.message}
          onChange={handleMessage}
          className="w-full resize-none rounded-xl p-4 pb-16"
          placeholder={placeholderText}
        />
        <input
          value={state.tag}
          onChange={handleTagChange}
          onKeyDown={handleTagEnter}
          className="w-full rounded-xl p-2"
          placeholder="Separate tags with ,"
        />
        {renderTags()}
        {renderUploadButton()}
        {renderSelectedImages()}
      </div>
      <Button type="submit" text="Post" primary rounded />
    </form>
  );
};

export default PostForm;
