import type { MutableRefObject } from "react";
import type { AnnouncementProps } from "~/types/announcement";

export interface PostFormStateProps extends Omit<AnnouncementProps, "id"> {
  tag: string;
  files: File[] | null;
}
export interface TypesOfAnnouncementProps
  extends Pick<AnnouncementProps, "type"> {
  name: string;
}

export interface CustomUploadButtonType {
  inputRef: InputRef;
  setFile: SetFile;
}
export type InputRef = MutableRefObject<HTMLInputElement | null>;
export type SetFile = React.Dispatch<
  React.SetStateAction<PostFormStateProps["files"]>
>;
