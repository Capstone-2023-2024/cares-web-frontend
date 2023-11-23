import type { MutableRefObject } from "react";
import type { AnnouncementProps } from "@cares/types/announcement";

interface PostFormStateProps extends AnnouncementProps {
  files: File[] | null;
}
interface TypesOfAnnouncementProps extends Pick<AnnouncementProps, "type"> {
  name: string;
}
interface CustomUploadButtonType {
  inputRef: InputRef;
  setFile: SetFile;
}
type InputRef = MutableRefObject<HTMLInputElement | null>;
type SetFile = React.Dispatch<
  React.SetStateAction<PostFormStateProps["files"]>
>;

export type {
  PostFormStateProps,
  TypesOfAnnouncementProps,
  CustomUploadButtonType,
  InputRef,
  SetFile,
};
