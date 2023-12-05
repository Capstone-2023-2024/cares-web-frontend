import type { MutableRefObject } from "react";
import type {
  AnnouncementProps,
  MarkedDatesProps,
} from "@cares/common/types/announcement";

interface PostFormStateProps extends Omit<AnnouncementProps, "markedDates"> {
  files: File[] | null;
  markedDates: MarkedDatesProps;
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
