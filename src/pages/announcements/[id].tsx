import { announcementType } from "@cares/utils/announcement";
import { useRouter } from "next/router";
import React from "react";
import Calendar from "~/components/Calendar";
import Header from "~/components/Header/Header";
import Selection from "~/components/Selection";
import { useAnnouncement } from "~/contexts/AnnouncementProvider";
import { useDate } from "~/contexts/DateProvider";
import { useToggle } from "~/contexts/ToggleProvider";

const AnnouncementWithId = () => {
  const router = useRouter();
  const { data } = useAnnouncement();

  const result = data.filter((props) => router.query.id === props.id);

  return (
    <div>
      {result.map(
        (
          {
            type,
            title,
            state,
            endDate,
            message,
            postedBy,
            department,
            markedDates,
            ...rest
          },
          index,
        ) => {
          const { selectedDateArray } = useDate();
          //   const { toggleCalendar } = useToggle();
          //   toggleCalendar();
          console.log(rest);

          return (
            <div
              key={index}
              className="relative min-h-screen animate-gradient-sm bg-gradient-to-t from-primary via-paper to-paper bg-[length:400%_400%] sm:animate-gradient-md md:animate-gradient-lg"
            >
              <Header />
              <p>{department}</p>
              <p>{postedBy}</p>
              <Selection
                value={type}
                options={announcementType.map((props) => props.type)}
              />
              <p>{title}</p>
              <p>{message}</p>
              <p>{endDate}</p>
              <Calendar />
              <p>{markedDates.toString()}</p>
              <p>{}</p>
            </div>
          );
        },
      )}
    </div>
  );
};

export default AnnouncementWithId;
