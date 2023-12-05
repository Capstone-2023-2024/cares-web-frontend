import type { AnnouncementProps } from "@cares/common/types/announcement";
import type { FirestoreDatabaseProps } from "@cares/common/types/document";

export interface CardProps extends AnnouncementProps, FirestoreDatabaseProps {}
