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
import { db, retrieveImageFBStorage } from "~/utils/firebase";
import { icon, imageDimension } from "~/utils/image";
import Button from "../Button";
import { useDate } from "~/contexts/DateContext";

interface MonthlyActivitiesValuesType {
  data: AnnouncementType[];
  isEditing?: boolean;
}
interface DeleteProps extends Omit<MonthlyActivitiesValuesType, "data"> {
  docId?: string;
}

interface CardProps extends AnnouncementType, DeleteProps {}

const MonthlyActivities = () => {
  const [values, setValues] = useState<MonthlyActivitiesValuesType>();
  const { announceNameRef } = useDate();

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

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, announceNameRef), orderBy("dateCreated")),
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
    );
    return () => unsub();
  }, [announceNameRef]);

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="flex gap-2">
          <Button type="button" onClick={toggleEdit}>
            <Image src="/pencil.png" alt="" {...imageDimension(icon)} />
          </Button>
        </div>
      </div>
      <div className="mx-2 flex gap-2 overflow-x-auto rounded-xl bg-black/10 p-4">
        {values?.data?.map((props) => (
          <Card key={props.docId} isEditing={values.isEditing} {...props} />
        ))}
      </div>
    </div>
  );
};

const Card = ({
  docId,
  isEditing,
  dateCreated,
  photoUrl,
  department,
  message,
  ...rest
}: CardProps) => {
  const newDate = new Date();
  newDate.setTime(dateCreated);
  return (
    <div className="flex min-w-max rounded-xl bg-primary/70 p-4">
      <DeleteButton docId={docId} isEditing={isEditing} />
      <div>
        <Heading department={department} />
        <p className="flex flex-col p-2">
          {message.substring(0, 24)}
          <span className="text-xs">{`Date Created: ${newDate.toLocaleString()}`}</span>
        </p>
      </div>
      <RenderPhoto photoUrl={photoUrl} />
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
  console.log({ photoUrl });
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

const DeleteButton = ({ isEditing, docId }: DeleteProps) => {
  const { announceNameRef } = useDate();
  async function handleDelete(
    event: React.MouseEvent<HTMLButtonElement>,
    docId: string
  ) {
    event.preventDefault();
    await deleteDoc(doc(db, `${announceNameRef}/${docId}`));
  }

  return (
    <button
      disabled={!isEditing}
      className={`${
        isEditing ? "bg-red-500 text-white" : "bg-primary text-black/40"
      } px-1 capitalize duration-300 ease-in-out`}
      onClick={(e) => {
        void handleDelete(e, docId ?? "");
      }}
    >
      del
    </button>
  );
};

export default MonthlyActivities;
