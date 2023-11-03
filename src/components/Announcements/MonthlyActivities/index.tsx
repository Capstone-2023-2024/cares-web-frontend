import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import { useAnnouncement } from "~/contexts/AnnouncementContext";
import { db, retrieveImageFBStorage } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";
import AnnouncementTypesSelection from "../PostForm/AnnouncementTypesSelection";
import { AnnouncementProps } from "~/types/announcement";
import { InitStateProps } from "./types";
import { vendored } from "next/dist/server/future/route-modules/pages/module.compiled";

const MonthlyActivities = () => {
  const { type, handleTypeChange, orderBy, handleOrderBy, tag, handleTag } =
    useAnnouncement();

  return (
    <div>
      <div className="flex items-center justify-around gap-2">
        <div className="flex items-center justify-center">
          <p className="capitalize">type:</p>
          <div className="min-w-24 w-max">
            <AnnouncementTypesSelection
              value={type}
              onChange={handleTypeChange}
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <p className="capitalize">order by:</p>
          <div className="min-w-24 w-max">
            <select
              className="w-full rounded-lg bg-primary p-2 capitalize text-paper"
              value={orderBy}
              onChange={handleOrderBy}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <p className="capitalize">search by tag:</p>
          <div className="min-w-24 w-max">
            <input
              className="w-full rounded-lg border border-primary p-1 capitalize text-primary"
              value={tag}
              onChange={handleTag}
            />
          </div>
        </div>
      </div>
      <div className="mx-2 flex gap-2 overflow-x-auto rounded-xl bg-black/10 p-4">
        <Card />
      </div>
    </div>
  );
};

const Card = () => {
  const initState: InitStateProps = {
    toggle: false,
    isEditing: false,
    message: "",
    tags: [],
    photoUrl: [],
  };
  const { data } = useAnnouncement();
  const [state, setState] = useState(initState);
  const rowsOffset = 40;

  function handleState(
    key: keyof typeof state,
    value:
      | (typeof state)["isEditing"]
      | (typeof state)["message"]
      | (typeof state)["photoUrl"]
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }
  function handlePressButton(e: MouseEvent<HTMLButtonElement>) {
    handleState("toggle", false);
  }
  function handleMouseEnter(index: number) {
    handleState("toggle", true);
    const target = data[index] as AnnouncementProps;
    setState((prevState) => ({ ...prevState, ...target }));
  }
  const renderPhotos = (photoUrl: string[]) =>
    photoUrl?.map((v, i) => {
      return (
        <div className="h-auto w-auto p-2">
          <Image
            key={i}
            alt=""
            priority
            quality={5}
            src={retrieveImageFBStorage(v ?? "")}
            {...imageDimension(120)}
          />
        </div>
      );
    });

  return data.map(
    ({ id, message, dateCreated, photoUrl, department, tags, postedBy }, i) => {
      const date = new Date();
      date.setTime(dateCreated);

      function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        handleState("message", event.target.value);
      }
      async function handleDelete(id: string) {
        try {
          await deleteDoc(doc(collection(db, "announcement"), id));
        } catch (err) {
          console.log(err);
        }
      }
      async function handleMouseLeave(event: MouseEvent<HTMLTextAreaElement>) {
        event.preventDefault();
        if (state.isEditing) {
          event.currentTarget.blur();

          await updateDoc(doc(collection(db, "announcement"), id), {
            message: state.message,
            // tags: state.tags,
            // photoUrl: state.photoUrl,
            dateEdited: new Date().getTime(),
          });
          setState(initState);
        }
      }
      const renderHeading = () => {
        return (
          <div className="flex w-full min-w-max items-center justify-around">
            <Image src="/CICS.png" alt="" {...imageDimension(icon * 2)} />
            <h2 className="flex flex-col text-center font-bold uppercase">
              <span>{department}</span>department
            </h2>
          </div>
        );
      };
      const renderPhoto = () => {
        return (
          <div className="h-24 w-24 rounded-xl">
            <Image
              alt=""
              priority
              quality={5}
              className="h-full w-full object-cover"
              src={retrieveImageFBStorage(photoUrl?.[0] ?? "")}
              {...imageDimension(120)}
            />
          </div>
        );
      };
      const renderTags = () => {
        return tags.map((value) => {
          return (
            <p key={value} className="rounded-lg bg-paper px-2 py-1">
              {value}
            </p>
          );
        });
      };

      return (
        <div
          key={id}
          onMouseEnter={() => handleMouseEnter(i)}
          className="flex min-w-max rounded-xl bg-primary p-4"
        >
          {state.toggle && (
            <section className="fixed inset-0 bg-paper/[.99]">
              <button
                className="absolute right-0 top-0 rounded-full bg-red-500 p-2 px-4 text-paper"
                onClick={handlePressButton}
              >
                x
              </button>
              <button
                className="absolute inset-x-0 bottom-12 mx-auto rounded-full bg-red-500 p-2 px-4 text-paper"
                onClick={() => void handleDelete(id)}
              >
                Delete Post
              </button>
              <h1 className="p-2 text-center text-lg font-bold">{`Posted by: ${postedBy}`}</h1>
              <div className="mx-auto w-2/3 rounded-lg p-2 shadow-sm">
                <p className="text-center">Message:</p>
                <div className="relative mx-auto w-1/3 rounded-lg bg-primary/20 p-2">
                  <button
                    className="absolute right-0 rounded-lg bg-primary p-2 text-paper shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleState("isEditing", true);
                    }}
                  >
                    Edit
                  </button>
                  <textarea
                    className={`${
                      state.isEditing ? "" : "bg-transparent"
                    } max-h-[22rem] w-full resize-none p-2 duration-300 ease-in-out`}
                    onMouseLeave={handleMouseLeave}
                    rows={Math.floor(message.length / rowsOffset)}
                    disabled={!state.isEditing}
                    value={state.message}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="p-x-12 mx-auto flex w-64 flex-row items-center gap-2 overflow-x-auto rounded-lg bg-primary py-6  shadow-sm">
                <p>photos:</p>
                {renderPhotos(state.photoUrl)}
              </div>
              <div className="mx-auto flex w-64 flex-row items-center gap-2 overflow-x-auto rounded-lg bg-primary p-2 shadow-sm">
                <p className="font-semibold capitalize text-white">tags:</p>
                {renderTags()}
              </div>
            </section>
          )}

          <div>
            {renderHeading()}
            <div className="flex flex-col p-2">
              {message.substring(0, 24)}
              <div className="flex w-2/3 flex-row items-center justify-center overflow-x-auto text-xs">
                <p className="capitalize">tags:</p>
                {renderTags()}
              </div>
            </div>
            <span className="text-xs">{`Date Created: ${date.toLocaleString()}`}</span>
          </div>
          {photoUrl && renderPhoto()}
        </div>
      );
    }
  );
};

export default MonthlyActivities;
