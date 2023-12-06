import type { AnnouncementProps } from "@cares/common/types/announcement";
import { announcementType } from "@cares/common/utils/announcement";
import { getImageFromStorage, imageDimension } from "@cares/common/utils/media";
import { addDoc, collection } from "firebase/firestore";
import { uploadBytes } from "firebase/storage";
import Image from "next/image";
import React, { useRef, useState, type ChangeEvent } from "react";
import type { AnnouncementStateProps } from "~/contexts/AnnouncementProvider/types";
import { useAuth } from "~/contexts/AuthProvider";
import { useDate } from "~/contexts/DateProvider";
import { useToggle } from "~/contexts/ToggleProvider";
import { env } from "~/env";
import { notification } from "~/pages/api/onesignal";
import { markedDatesHandler } from "~/utils/date";
import { db, storageRef } from "~/utils/firebase";
import Button from "../Button";
import Selection from "../Selection";
import UploadButton from "../UploadButton";
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
    endDate: 0,
    markedDates: {
      color: "blue",
      // dotColor: "",
      textColor: "white",
      calendar: [],
    },
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

  function handleFilePick() {
    try {
      const reference = inputRef.current;
      if (reference?.files !== null) {
        const pickedFiles = reference?.files ? [...reference?.files] : [];
        pickedFiles.forEach((file, index) => {
          const oFReader = new FileReader();
          oFReader.readAsDataURL(file);
          oFReader.onload = (oFREvent) => {
            const result = oFREvent.target?.result;
            if (result !== null && result !== undefined) {
              const src = result as string;
              const image = document.querySelector<HTMLImageElement>(
                `#${imagePrefix}${index}`,
              );
              image ? (image.src = src) : null;
            }
          };
        });
        setState((prevState) => ({
          ...prevState,
          files: pickedFiles,
        }));
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
  /** TODO: Optimize this madness */
  function handleSubmit(event: React.MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    const form: HTMLFormElement = event.currentTarget;
    const textarea = form.querySelector(
      "#message",
    ) as unknown as HTMLTextAreaElement;
    const noTitleNoMessage = textarea === null && state.title.trim() === "";

    if (typeOfAccount === null) {
      return alert("You do not have the permission to do this action");
    }
    if (noTitleNoMessage) {
      return alert("Please enter a title");
    }
    async function upload() {
      try {
        const photoUrls: string[] = [];
        state.files?.map(async (props) => {
          photoUrls.push(props.name);
          await uploadImage(props);
        });
        const selectedArrLength = selectedDateArray.length;
        const lastValueInSelectedArray =
          selectedDateArray[selectedArrLength - 1] ?? -1;
        const endDate = new Date();
        endDate.setDate(lastValueInSelectedArray);
        endDate.setFullYear(year);
        endDate.setMonth(month);

        const announcement: AnnouncementProps = {
          postedBy: state.postedBy,
          type: state.type,
          title: state.title,
          state: state.state,
          message: textarea.value,
          department: "cics",
          dateCreated: new Date().getTime(),
          endDate: endDate.getTime(),
          markedDates: markedDatesHandler(
            selectedDateArray,
            year,
            month,
            state.markedDates,
          ),
        };

        const name = state.files?.map((props) => props.name);
        const storageName = getImageFromStorage({
          imageName: name?.[0] ?? "",
          storageBucket: env.NEXT_PUBLIC_FIRESTORE_STORAGE_BUCKET,
          ref: "images",
        });
        const notifResult = await notification({
          contents: {
            en: state.message,
          },
          headings: {
            en: state.title,
          },
          web_buttons: [
            {
              id: "pick",
              text: "Pick",
              icon: "",
              url: "",
            },
          ],
          name: state.title,
          android_channel_id:
            env.NEXT_PUBLIC_ONESIGNAL_DEFAULT_ANDROID_CHANNEL_ID,
          included_segments: ["Cares Mobile Users"],
          big_picture: storageName,
          priority: 10,
        });
        console.log({ notifResult });

        await addDoc(
          collection(db, "announcement"),
          state.files === null
            ? { ...announcement }
            : { ...announcement, photoUrls },
        );

        changeSelectedDateArray([]);
        toggleCalendar();
        setState(initState);
      } catch (err) {
        return console.log(err);
      }
    }
    return void upload();
  }

  const renderSelectedImages = () => (
    <div className="flex h-24 w-full overflow-x-auto">
      {state.files?.map((value, index) => {
        const reader = new FileReader();
        reader.readAsDataURL(value);
        console.log({ reader });
        return (
          <div key={index} className="relative inline-table h-24 w-36">
            <button
              disabled={!showCalendar}
              type="button"
              onClick={() =>
                handleRemoveFromArray({
                  array: state.files ?? [],
                  index,
                })
              }
              className="absolute right-0 top-0 rounded-full bg-primary/70 px-2 py-1 text-xs text-paper"
            >
              x
            </button>
            {/*eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src=""
              id={`${imagePrefix}${index.toString()}`}
              className="h-auto w-auto"
              {...imageDimension(48)}
            />
          </div>
        );
      })}
    </div>
  );

  console.log(inputRef.current);

  return (
    <form
      method="post"
      encType="multipart/form-data"
      onSubmit={(e: React.MouseEvent<HTMLFormElement>) => {
        void handleSubmit(e);
      }}
      className=" mx-auto my-8 flex w-5/6 flex-col items-center justify-center gap-2 rounded-xl bg-primary/50 py-4"
    >
      <p className="mt-8 flex items-center gap-2 text-2xl font-semibold uppercase">
        <span>
          <Image src="/CICS.png" {...imageDimension(50)} alt="" />
        </span>
        CICS Department
      </p>
      <p className="mt-4 text-center"></p>
      <div className="relative w-3/4">
        <Selection
          value={state.type}
          onChange={handleTypeChange}
          disabled={!showCalendar}
          options={announcementType.map((props) => props.type)}
        />
        <textarea
          disabled={!showCalendar}
          value={state.title}
          onChange={handleTitle}
          className="w-full resize-none rounded-xl p-2"
          rows={1}
          placeholder="Enter title"
        />
        <textarea
          id="message"
          required
          disabled={!showCalendar}
          value={state.message}
          onChange={handleMessage}
          className="w-full resize-none rounded-xl p-4 pb-16"
          placeholder={placeholderText}
        />
        <UploadButton
          ref={inputRef}
          disabled={!showCalendar}
          onChange={handleFilePick}
        />
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
