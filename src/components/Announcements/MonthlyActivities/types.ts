import type { AnnouncementProps } from "~/types/announcement";

export interface InitStateProps {
  toggle: boolean;
  isEditing: boolean;
  message: string;
  tags: string[];
  photoUrl: string[];
}

export interface DeleteProps extends Pick<InitStateProps, "isEditing"> {
  id: string;
}

export interface CardProps extends AnnouncementProps, DeleteProps {}
