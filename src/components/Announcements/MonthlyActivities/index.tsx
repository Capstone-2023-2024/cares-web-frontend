import { deleteDoc, doc } from "firebase/firestore";
import Image from "next/image";
import { useState } from "react";
import Button from "~/components/Button";
import { useAnnouncement } from "~/contexts/AnnouncementContext";
import { db, retrieveImageFBStorage } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";
import AnnouncementTypesSelection from "../PostForm/AnnouncementTypesSelection";
import type { CardProps, DeleteProps, InitStateProps } from "./types";

const MonthlyActivities = () => {
  const initState: InitStateProps = {
    toggle: false,
    isEditing: false,
    message: "",
    tags: [],
    photoUrl: [],
  };
  const {
    data,
    type,
    handleTypeChange,
    orderBy,
    handleOrderBy,
    tag,
    handleTag,
  } = useAnnouncement();
  const [state, setState] = useState(initState);

  function toggleEdit() {
    const isEditing = !state.isEditing;
    setState((prevState) => ({ ...prevState, isEditing }));
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-around gap-2">
        <div className="flex items-center justify-center">
          <p className="text-lg capitalize">type: &nbsp;&nbsp;&nbsp;&nbsp;</p>
          <div className="min-w-24 w-fit">
            <AnnouncementTypesSelection
              value={type}
              onChange={handleTypeChange}
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <p className="text-lg capitalize">order: &nbsp;&nbsp;&nbsp;&nbsp;</p>
          <div className="min-w-24 w-fit">
            <select
              className="w-full rounded-lg bg-primary p-2 pl-16 pr-16 capitalize text-paper"
              value={orderBy}
              onChange={handleOrderBy}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <p className="text-lg capitalize">
            search by: &nbsp;&nbsp;&nbsp;&nbsp;
          </p>
          <div className="min-w-24 w-fit">
            <input
              placeholder="Tag"
              className="w-full rounded-lg border border-primary p-1 text-primary"
              value={tag}
              onChange={handleTag}
            />
          </div>
        </div>
      </div>
      <Button type="button" onClick={toggleEdit}>
        {<Image src="/pencil.png" alt="" {...imageDimension(icon)} />}
      </Button>
      <div className="mx-2 flex gap-2 overflow-x-auto rounded-xl bg-black/10 p-4">
        {data.map((props, index) => {
          return <Card key={index} {...props} isEditing={state.isEditing} />;
        })}
      </div>
    </div>
  );
};

const Card = ({
  dateCreated,
  isEditing,
  id,
  department,
  message,
  photoUrl,
}: CardProps) => {
  const newDate = new Date();
  newDate.setTime(dateCreated);
  return (
    <div className="flex min-w-max rounded-xl bg-primary/75 p-4">
      <DeleteButton id={id} isEditing={isEditing} />
      <div>
        <Heading department={department} />
        <p className="flex flex-col p-2">
          {message.substring(0, 24)}
          <span className="text-xs">{`Date Created: ${newDate.toLocaleString()}`}</span>
        </p>
      </div>
      {photoUrl?.map((url, i) => {
        return <RenderPhoto key={i} photoUrl={url} />;
      })}
    </div>
  );
};

const Heading = ({ department }: { department: string }) => (
  <div className="flex w-full min-w-max items-center justify-around">
    <Image src="/CICS.png" alt="" {...imageDimension(icon * 2)} />
    <h2 className="flex flex-col text-center font-bold uppercase">
      <span>{department}</span>department
    </h2>
  </div>
);

const RenderPhoto = ({ photoUrl }: { photoUrl?: string }) => {
  return (
    <div className="h-24 w-24 rounded-xl">
      <Image
        alt=""
        priority
        quality={5}
        className="h-full w-full object-cover"
        src={photoUrl ? retrieveImageFBStorage(photoUrl) : "/Image.png"}
        {...imageDimension(120)}
      />
    </div>
  );
};

const DeleteButton = ({ isEditing, id }: DeleteProps) => {
  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) {
    event.preventDefault();
    await deleteDoc(doc(db, `announcement/${id}`));
  }

  return (
    <button
      disabled={!isEditing}
      className={`${
        isEditing ? "bg-red-500 text-white" : "bg-primary text-black/40"
      } px-1 capitalize duration-300 ease-in-out`}
      onClick={(e) => {
        void handleDelete(e, id ?? "");
      }}
    >
      del
    </button>
  );
};

export default MonthlyActivities;
