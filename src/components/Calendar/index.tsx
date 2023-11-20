import { useDate } from "~/contexts/DateContext";
import Map from "./Map";
import WeekHeader from "./WeekHeader";

const Calendar = () => {
  const { month, year } = useDate();

  return (
    <section className=" p-5 shadow-sm ">
      <WeekHeader />
      <Map {...{ month, year }} />
    </section>
  );
};

export default Calendar;
