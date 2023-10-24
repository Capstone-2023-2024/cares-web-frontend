import type {DateFileProps, FirestoreDatabaseProps} from './firebase';
import type {PhotoMediaProps} from './media';

export interface AnnouncementProps
  extends DateFileProps,
    FirestoreDatabaseProps,
    PhotoMediaProps {
  message: string;
  department: 'cite';
  state: 'unpinned' | 'pinned';
  markedDates: string[];
}
