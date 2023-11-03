import type { ChangeEvent, ReactNode } from "react";
import type { AnnouncementProps } from "~/types/announcement";

export interface AnnouncementStateProps
  extends Pick<AnnouncementProps, "type"> {
  tag: string;
  orderBy: "asc" | "desc";
  data: AnnouncementProps[];
}

export type AnnouncementStateValue =
  | AnnouncementStateProps["type"]
  | AnnouncementStateProps["data"]
  | AnnouncementStateProps["orderBy"]
  | AnnouncementStateProps["tag"];

export interface AnnouncementContextProps extends AnnouncementStateProps {
  handleTypeChange: (value: ChangeEvent<HTMLSelectElement>) => void;
  handleOrderBy: (value: ChangeEvent<HTMLSelectElement>) => void;
  handleTag: (value: ChangeEvent<HTMLInputElement>) => void;
}
export interface AnnouncementProviderProps {
  children: ReactNode;
}
