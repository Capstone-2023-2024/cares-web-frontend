import React from "react";
import Main from "~/components/Main";
import Map from "shared/calendar/Map";
import { useDate } from "~/contexts/DateContext";

const Calendar = () => {
  const { month, year } = useDate();
  return (
    <Main>
      <Map {...{ month, year }} />
      <h2>Calendar</h2>
    </Main>
  );
};

export default Calendar;
