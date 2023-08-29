import { useDate } from "~/contexts/DateContext";
import Map from "./Map";
import WeekHeader from "./WeekHeader";

const Calendar = () => {
  const { month, year } = useDate();

  return (
    <section className="mx-auto my-10 flex w-2/3 flex-col gap-2 rounded-xl ">
      <WeekHeader />
      <Map {...{ month, year }} />
    </section>
  );
};

export default Calendar;
