import type { NotificationProps } from "@cares/common/types/announcement";
import { env } from "~/env";

async function notifResponse(
  notifData: NotificationProps,
  restApiKey: string,
  onesignalId: string,
) {
  try {
    const notifPromise = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${restApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: `${onesignalId}`,
          ...notifData,
        }),
      },
    );
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await notifPromise.json();
    //eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response;
  } catch (err) {
    console.log(err);
  }
}

async function notification(notifData: NotificationProps) {
  //eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await notifResponse(
    notifData,
    env.NEXT_PUBLIC_ONESIGNAL_REST_API_KEY,
    env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
  );
}

export { notification };
