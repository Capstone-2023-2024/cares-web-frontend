import axios from "axios";
import { env } from "~/env";

/** @Reference_here https://documentation.onesignal.com/reference/create-notification#send-to-users-based-on-filters */
interface FilterProps {
  field:
    | "amount_spent"
    | "last_session"
    | "first_session"
    | "session_count"
    | "session_time"
    | "bought_sku"
    | "tag"
    | "language"
    | "app_version"
    | "location"
    | "country";
  key?: string;
  value: string;
  relation: "<" | ">" | "=" | "!=";
}

interface OperatorProps {
  operator: "AND" | "OR";
}

interface MessageProps {
  en: string;
}

interface WebButtonProps {
  id: string;
  text: string;
  icon: string;
  url: string;
}

interface NotificationProps {
  included_segments?: (
    | "Student and Faculty"
    | "Subscribed Users"
    | "Cares Mobile Users"
    | "Total Subscriptions"
  )[];
  filters?: (FilterProps | OperatorProps)[];
  contents?: MessageProps;
  headings?: MessageProps;
  web_buttons?: WebButtonProps[];
  name: string;
  /** Photo preview */
  big_picture?: string;
  priority?: number;
  android_channel_id?: string;
  include_external_user_ids?: string[];
  include_player_ids?: string[];
}

/** `name` is the title of the notification, `englishContent` is the `en` in `contents` object, `included_segments` are the target `external_id` is linked to student number @Check: https://documentation.onesignal.com/docs/segmentation*/
export default async function handler({ ...rest }: NotificationProps) {
  const options = {
    method: "POST",
    url: "https://onesignal.com/api/v1/notifications",
    headers: {
      accept: "application/json",
      Authorization: `Basic ${env.NEXT_PUBLIC_ONESIGNAL_REST_API_KEY}`,
      "content-type": "application/json",
    },
    data: {
      app_id: `${env.NEXT_PUBLIC_ONESIGNAL_APP_ID}`,
      ...rest,
    },
  };

  return await axios.request(options);
}
