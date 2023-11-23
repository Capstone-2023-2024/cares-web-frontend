import type { AnnouncementProps } from "@cares/types/announcement";
import { announcementType } from "@cares/utils/announcement";
import { formatDateOrMonth } from "@cares/utils/document";
import { imageDimension } from "@cares/utils/media";
import { addDoc, collection } from "firebase/firestore";
import { uploadBytes } from "firebase/storage";
import Image from "next/image";
import React, { useRef, useState, type ChangeEvent } from "react";
import type { AnnouncementStateProps } from "~/contexts/AnnouncementProvider/types";
import { useAuth } from "~/contexts/AuthProvider";
import { useDate } from "~/contexts/DateProvider";
import { useToggle } from "~/contexts/ToggleProvider";
import { db, storageRef } from "~/utils/firebase";
import Button from "../../Button";
import AnnouncementTypesSelection from "./AnnouncementTypesSelection";
import type { InputRef, PostFormStateProps } from "./types";

const PostForm = () => {
  const { currentUser } = useAuth();
  const { showCalendar } = useToggle();
  const initState: PostFormStateProps = {
    postedBy: currentUser?.email ?? "",
    files: null,
    title: "",
    type: announcementType[0]?.type ?? "event",
    message: "",
    state: "unpinned",
    department: "cics",
    dateCreated: new Date().getTime(),
    markedDates: [],
    endDate: 0,
  };
  const [state, setState] = useState(initState);
  const { toggleCalendar } = useToggle();
  const { selectedDateArray, year, month, changeSelectedDateArray } = useDate();
  const inputRef: InputRef = useRef(null);
  const { typeOfAccount } = useAuth();
  const imagePrefix = "image_";
  const placeholderText =
    state.type === "event"
      ? "What's happening in our campus?"
      : state.type === "recognition"
        ? "Tell the details for the recognition"
        : "Create a summary of the University Memorandum";

  function previewImage(file: File, index: number) {
    const oFReader = new FileReader();
    oFReader.readAsDataURL(file);
    oFReader.onload = (oFREvent) => {
      const result = oFREvent.target?.result;
      if (result !== null && result !== undefined) {
        const imageContainer = document.getElementById(
          `${imagePrefix}${index}`,
        ) as HTMLImageElement;
        return (imageContainer.src = result as string);
      }
    };
  }
  function getImageArray(files: File[]) {
    files.forEach((file, index) => {
      previewImage(file, index);
    });
  }
  function handleFilePick() {
    try {
      const inRef = inputRef.current;
      if (inRef !== null) {
        if (inRef.files !== null) {
          const pickedFiles = [...inRef.files];
          getImageArray(pickedFiles);
          setState((prevState) => ({ ...prevState, files: pickedFiles }));
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  function handleMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const message = event.target.value;
    setState((prevState) => ({ ...prevState, message }));
  }
  function handleRemoveFromArray({
    array,
    index,
  }: {
    array: (File | string)[] | null;
    index: number;
  }) {
    if (array !== null) {
      const newArray = array.filter((v, i) => index !== i);
      if (typeof newArray[0] === "string") {
        const tags = [...newArray] as string[];
        return setState((prevState) => ({ ...prevState, tags }));
      }
      const files = [...newArray] as File[];
      return setState((prevState) => ({ ...prevState, files }));
    }
  }
  function handleTitle(event: ChangeEvent<HTMLTextAreaElement>) {
    setState((prevState) => ({ ...prevState, title: event.target.value }));
  }
  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as AnnouncementStateProps["type"];
    setState((prevState) => ({ ...prevState, type }));
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
    /** If it returns -1, the value passed is undefined,
     *  It will automatically parse 4 length string to year,
     *  so only pass stringed numbers here
     */
    function stringedNumDateFormatter(value?: string) {
      const lengthOfYear = 4;
      if (value !== undefined) {
        if (value.length === lengthOfYear) {
          const year = JSON.parse(value) as number;
          return year;
        }
        const getCharacter = value.startsWith("0") ? value.substring(1) : value;
        const numberify = JSON.parse(getCharacter) as number;
        return numberify;
      }
      return -1;
    }

    if (typeOfAccount !== null) {
      try {
        event.preventDefault();
        const form: HTMLFormElement = event.currentTarget;
        const textarea = form.querySelector("textarea");
        const markedDates = selectedDateArray.map(
          (value) =>
            `${year}-${formatDateOrMonth(month + 1)}-${formatDateOrMonth(
              value,
            )}`,
        );

        if (textarea !== null && state.title.trim() === "") {
          const photoUrl: string[] = [];
          state.files?.map(async (props) => {
            photoUrl.push(props.name);
            await uploadImage(props);
          });
          const newDate = new Date();
          const lastMarkedDate = markedDates[markedDates.length - 1];
          const targetCharacter = "-";
          const first = lastMarkedDate?.indexOf(targetCharacter);
          const last = lastMarkedDate?.lastIndexOf(targetCharacter);
          const year = lastMarkedDate?.substring(0, first);
          const month = lastMarkedDate?.substring((first ?? 0) + 1, last);
          const date = lastMarkedDate?.substring((last ?? 0) + 1);

          newDate.setFullYear(stringedNumDateFormatter(year));
          newDate.setMonth(stringedNumDateFormatter(month));
          newDate.setDate(stringedNumDateFormatter(date));

          const announcement: AnnouncementProps = {
            postedBy: state.postedBy,
            type: state.type,
            title: state.title,
            state: state.state,
            message: textarea.value,
            department: "cics",
            dateCreated: new Date().getTime(),
            endDate: newDate.getTime(),
            markedDates,
          };
          await addDoc(
            collection(db, "announcement"),
            state.files === null
              ? { ...announcement }
              : { ...announcement, photoUrl },
          );

          changeSelectedDateArray([]);
          toggleCalendar();
          return setState(initState);
        }
        return alert("Please enter atleast one tag");
      } catch (err) {
        console.log(err);
        const files = null;
        return setState((prevState) => ({ ...prevState, files }));
      }
    }
    alert("You do not have the permission to do this action");
  }
  const renderUploadButton = () => {
    return (
      <div className="absolute right-0 top-36 z-10 flex w-24 overflow-hidden rounded-xl bg-blue-400/40 px-4 py-2 text-white/40 duration-300 ease-in-out hover:bg-blue-400 hover:text-white">
        <label className="absolute inset-x-0 mx-auto w-2/3 self-center text-center text-xs">
          {state.files !== null && state.files.length > 0
            ? "Add images"
            : "Choose Images"}
        </label>
        <input
          multiple
          type="file"
          ref={inputRef}
          disabled={!showCalendar}
          onChange={handleFilePick}
          accept=".jpg, .jpeg, .png"
          className={`${
            !showCalendar ? "" : "cursor-pointer"
          } h-full w-full scale-150 opacity-0`}
        />
      </div>
    );
  };
  const renderSelectedImages = () => {
    return (
      <div className="h-24 w-full overflow-x-auto">
        {state.files?.map((value, i) => {
          return (
            <div key={i} className="relative inline-table h-24 w-12">
              <button
                disabled={!showCalendar}
                type="button"
                onClick={() =>
                  handleRemoveFromArray({
                    array: state.files ?? [],
                    index: i,
                  })
                }
                className="absolute right-0 top-0 rounded-full bg-primary/70 px-2 py-1 text-xs text-paper"
              >
                x
              </button>
              {/*eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                id={`${imagePrefix}${i.toString()}`}
                className="h-auto w-auto"
                {...value}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <form
      method="post"
      encType="multipart/form-data"
      onSubmit={(e: React.MouseEvent<HTMLFormElement>) => {
        void handleSubmit(e);
      }}
      className="mx-auto my-10 flex w-5/6 flex-col items-center justify-center gap-2 rounded-xl bg-primary/50 py-4"
    >
      <p className="mt-8 flex items-center gap-2 text-2xl font-semibold uppercase">
        <span>
          <Image src="/CICS.png" {...imageDimension(50)} alt="" />
        </span>
        CICS Department
      </p>
      <p className="mt-4 text-center"></p>
      <div className="relative w-3/4">
        <AnnouncementTypesSelection
          disabled={!showCalendar}
          value={state.type}
          onChange={handleTypeChange}
        />
        <textarea
          required
          disabled={!showCalendar}
          value={state.message}
          onChange={handleMessage}
          className="w-full resize-none rounded-xl p-4 pb-16"
          placeholder={placeholderText}
        />
        <textarea
          disabled={!showCalendar}
          value={state.title}
          onChange={handleTitle}
          className="w-full rounded-xl p-2"
          placeholder="Enter title"
        />
        <p>{state.title}</p>
        {renderUploadButton()}
        {renderSelectedImages()}
      </div>
      <Button
        className="mb w-1/5"
        type="submit"
        disabled={!showCalendar}
        text="Create Post"
        primary
        rounded
      />
    </form>
  );
};

export default PostForm;
