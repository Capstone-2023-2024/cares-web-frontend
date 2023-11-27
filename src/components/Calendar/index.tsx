import { useDate } from "~/contexts/DateProvider";
import Map from "./Map";
import WeekHeader from "./WeekHeader";

const Calendar = ({ showCalendar }: { showCalendar?: boolean }) => {
  const { month, year } = useDate();

  return (
    <section className=" p-5 shadow-sm ">
      <WeekHeader />
      <Map {...{ month, year, showCalendar }} />
    </section>
  );
};

export default Calendar;
