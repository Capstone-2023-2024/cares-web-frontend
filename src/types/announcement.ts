import type { DateFileProps, FirestoreDatabaseProps } from "./firebase";
import type { PhotoMediaProps } from "./media";

export interface AnnouncementProps
  extends DateFileProps,
    FirestoreDatabaseProps,
    Partial<PhotoMediaProps> {
  type: "event" | "university_memorandum" | "recognition" | 'others';
  postedBy: string;
  tags: string[];
  message: string;
  department: "cics";
  state: "unpinned" | "pinned";
  markedDates: string[];
  endDate: number;
}
