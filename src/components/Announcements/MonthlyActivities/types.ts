import type { AnnouncementProps } from "@cares/types/announcement";
import type { FirestoreDatabaseProps } from "@cares/types/document";

export interface InitStateProps
  extends Pick<AnnouncementProps, "message" | "title" | "photoUrlArray"> {
  toggle: boolean;
  isEditing: boolean;
}

export interface DeleteProps
  extends Pick<InitStateProps, "isEditing">,
    FirestoreDatabaseProps {}

export interface CardProps extends AnnouncementProps, DeleteProps {}
