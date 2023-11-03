import type { DateFileProps, FirestoreDatabaseProps } from "./firebase";
import type { PhotoMediaProps } from "./media";

export interface AnnouncementProps
  extends DateFileProps,
    FirestoreDatabaseProps,
    Partial<PhotoMediaProps> {
  type: "event" | "university_memorandum" | "recognition";
  postedBy: string;
  tags: string[];
  message: string;
  department: "cite";
  state: "unpinned" | "pinned";
  markedDates: string[];
  endDate: number;
}

export type AnnouncementsValue =
  | AnnouncementProps["dateCreated"]
  | AnnouncementProps["dateEdited"]
  | AnnouncementProps["department"]
  | AnnouncementProps["markedDates"]
  | AnnouncementProps["message"]
  | AnnouncementProps["photoUrl"]
  | AnnouncementProps["state"]
  | AnnouncementProps["type"];
