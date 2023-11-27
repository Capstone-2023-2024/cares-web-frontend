import type { AnnouncementProps } from "@cares/types/announcement";
import type { FirestoreDatabaseProps } from "@cares/types/document";

export interface CardProps extends AnnouncementProps, FirestoreDatabaseProps {}
