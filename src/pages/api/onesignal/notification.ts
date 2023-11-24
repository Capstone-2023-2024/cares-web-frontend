import axios from "axios";
import { env } from "~/env";

interface NotificationProps {
  included_segments: ("Student and Faculty" | "Subscribed Users")[];
  englishContent: string;
  name: string;
}

/** `name` is the title of the notification, `englishContent` is the `en` in `contents` object, `included_segments` are the target @Check: https://documentation.onesignal.com/docs/segmentation */
export default async function handler({
  englishContent,
  ...rest
}: NotificationProps) {
  const options = {
    method: "POST",
    url: "https://onesignal.com/api/v1/notifications",
    headers: {
      "access-control-allow-origin": "*", 
      Authorization: `Basic ${env.NEXT_PUBLIC_ONESIGNAL_REST_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      app_id: `${env.NEXT_PUBLIC_ONESIGNAL_APP_ID}`,
      contents: {
        en: englishContent,
      },
      ...rest,
    },
  };

  return await axios.request(options);
}
