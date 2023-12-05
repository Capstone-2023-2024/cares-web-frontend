import { announcementType } from "@cares/common/utils/announcement";
import { getImageFromStorage, imageDimension } from "@cares/common/utils/media";
import Image from "next/image";
import { useRouter } from "next/router";
import { type ReactNode } from "react";
import Selection from "~/components/Selection";
import { useAnnouncement } from "~/contexts/AnnouncementProvider";
import { env } from "~/env.js";
import { ICON } from "~/utils/media";
import type { CardProps } from "./types";

const MonthlyActivities = () => {
  const {
    tag,
    type,
    data,
    orderBy,
    handleTag,
    handleOrderBy,
    handleTypeChange,
  } = useAnnouncement();

  return (
    <div>
      <div className="flex items-center justify-center">
        <FilterContainer name="type">
          <div className="min-w-24 w-fit">
            <Selection
              value={type}
              options={announcementType.map((props) => props.type)}
              onChange={handleTypeChange}
            />
          </div>
        </FilterContainer>
        <FilterContainer name="order_by">
          <div className="min-w-24 w-fit">
            <Selection
              value={orderBy}
              options={["asc", "desc"]}
              onChange={handleOrderBy}
            />
          </div>
        </FilterContainer>
        <FilterContainer name="search_by">
          <div className="min-w-24 w-fit">
            <input
              placeholder="Title"
              className="w-full rounded-lg border border-primary p-1 text-primary"
              value={tag}
              onChange={handleTag}
            />
          </div>
        </FilterContainer>
        {/* <Button type="button" onClick={toggleEdit}>
          {<Image src="/pencil.png" alt="" {...imageDimension(ICON)} />}
        </Button> */}
      </div>
      <div className=" mx-2 flex gap-2 overflow-x-auto rounded-xl bg-black/10 p-4">
        {data.map((props, index) => {
          return <Card key={index} {...props} />;
        })}
      </div>
    </div>
  );
};

const Card = ({ id, title, dateCreated, department, photoUrls }: CardProps) => {
  const newDate = new Date();
  const router = useRouter();
  newDate.setTime(dateCreated);
  return (
    <button
      onClick={() => void router.push(`announcements/${id}`)}
      className=" flex min-w-max rounded-xl bg-primary p-4 text-black duration-300 ease-in-out hover:bg-secondary hover:text-paper"
    >
      {/* <DeleteButton id={id} isEditing={isEditing} /> */}
      <div>
        <Heading department={department} />
        <p className="flex flex-col p-2">
          {title}
          <span className="text-xs">{`Date Created: ${newDate.toLocaleString()}`}</span>
        </p>
      </div>
      {photoUrls?.map((url, i) => {
        return <RenderPhoto key={i} photoUrl={url} />;
      })}
    </button>
  );
};

const Heading = ({ department }: { department: string }) => (
  <div className="flex w-full min-w-max items-center justify-around">
    <Image src="/CICS.png" alt="" {...imageDimension(ICON * 2)} />
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
        src={
          photoUrl
            ? getImageFromStorage({
                imageName: photoUrl,
                storageBucket: env.NEXT_PUBLIC_FIRESTORE_STORAGE_BUCKET,
                ref: "images",
              })
            : "/Image.png"
        }
        {...imageDimension(120)}
      />
    </div>
  );
};

const FilterContainer = ({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) => {
  return (
    <div className="flex w-max items-center justify-center gap-2 p-2">
      <p className="text-sm capitalize">{name.replace(/_/g, " ")}:</p>
      {children}
    </div>
  );
};

export default MonthlyActivities;
