import type { ChangeEvent, ReactNode } from "react";
import type { AnnouncementProps } from "@cares/types/announcement";
import type { FirestoreDatabaseProps } from "@cares/types/document";

interface ReadAnnouncementProps
  extends AnnouncementProps,
    FirestoreDatabaseProps {}

interface AnnouncementStateProps extends Pick<AnnouncementProps, "type"> {
  tag: string;
  orderBy: "asc" | "desc";
  data: ReadAnnouncementProps[];
}

interface AnnouncementContextProps extends AnnouncementStateProps {
  handleTypeChange: (value: ChangeEvent<HTMLSelectElement>) => void;
  handleOrderBy: (value: ChangeEvent<HTMLSelectElement>) => void;
  handleTag: (value: ChangeEvent<HTMLInputElement>) => void;
}
interface AnnouncementProviderProps {
  children: ReactNode;
}

export type {
  AnnouncementStateProps,
  AnnouncementContextProps,
  AnnouncementProviderProps,
};
