import { currentMonth } from "@cares/common/utils/date";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MonthlyActivities from "~/components/MonthlyActivities";
import PostForm from "~/components/PostForm";
import Button from "~/components/Button";
import Calendar from "~/components/Calendar";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthProvider";
import { useDate } from "~/contexts/DateProvider";
import { useToggle } from "~/contexts/ToggleProvider";

const Announcements = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { showCalendar } = useToggle();
  const { month, year, changeMonth, changeYear } = useDate();
  const monthName = currentMonth({
    month: month,
    year: year,
  })?.name;

  function handlePrev() {
    const newMonth = month - 1;
    if (newMonth < 0) {
      changeMonth(11);
      return changeYear(year - 1);
    }
    changeMonth(newMonth);
  }

  function handleNext() {
    const newMonth = month + 1;
    if (newMonth > 11) {
      changeMonth(0);
      return changeYear(year + 1);
    }
    changeMonth(newMonth);
  }

  useEffect(() => {
    async function setup() {
      try {
        if (currentUser === null) {
          await router.push("/login");
        }
      } catch (err) {
        console.log(err);
      }
    }
    return void setup();
  }, [currentUser, router]);

  return currentUser !== null ? (
    <Main withPathName moreThanOne>
      <div className="">
        <div className="flex items-center justify-between p-2 pt-12">
          <Button
            primary
            rounded
            disabled={showCalendar}
            onClick={handlePrev}
            text="prev"
          />
          <div className="mx-auto flex w-max gap-2 rounded-lg bg-primary/40 px-20 py-4 text-xl font-bold capitalize text-secondary shadow-sm">
            <h2>{monthName}</h2>
            <h2>{year}</h2>
          </div>
          <Button
            primary
            rounded
            disabled={showCalendar}
            onClick={handleNext}
            text="next"
          />
        </div>
      </div>
      <div className="">
        <div className={showCalendar ? "block" : "hidden"}>
          <PostForm />
        </div>
        <div className={showCalendar ? "hidden" : "block"}>
          <Calendar showCalendar={showCalendar} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <MonthlyActivities />
      </div>
    </Main>
  ) : (
    <Loading />
  );
};

export default Announcements;
