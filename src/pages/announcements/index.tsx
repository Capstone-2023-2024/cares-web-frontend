import { useRouter } from "next/router";
import { useEffect } from "react";
import MonthlyActivities from "~/components/Announcements/MonthlyActivities";
import PostForm from "~/components/Announcements/PostForm";
import ToggleWrapper from "~/components/Announcements/ToggleWrapper";
import Calendar from "~/components/Calendar";
import Loading from "~/components/Loading";
import Main from "~/components/Main";
import { useAuth } from "~/contexts/AuthContext";
import { useDate } from "~/contexts/DateContext";
import { useToggle } from "~/contexts/ToggleContext";
import { currentMonth } from "~/utils/date";

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
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser]);

  return currentUser !== null ? (
    <Main withPathName moreThanOne>
      <div className="mx-auto mt-8 flex w-96 flex-row justify-between">
        <button
          disabled={showCalendar}
          className={`${
            showCalendar
              ? "bg-slate-200 text-slate-300"
              : "bg-primary text-white"
          } rounded-lg p-2 capitalize`}
          onClick={handlePrev}
        >
          prev
        </button>
        <div className="flex items-center justify-center gap-2 text-xl font-semibold">
          <h2 className="text-center capitalize">{monthName}</h2>
          <h2 className="text-center capitalize">{year}</h2>
        </div>
        <button
          disabled={showCalendar}
          className={`${
            showCalendar
              ? "bg-slate-200 text-slate-300"
              : "bg-primary text-white"
          } rounded-lg p-2 capitalize`}
          onClick={handleNext}
        >
          next
        </button>
      </div>
      <div className="min-h-96 relative h-[70vh] overflow-hidden">
        <ToggleWrapper condition={showCalendar}>
          <PostForm />
        </ToggleWrapper>
        <ToggleWrapper condition={!showCalendar}>
          <Calendar />
        </ToggleWrapper>
      </div>
      <MonthlyActivities />
    </Main>
  ) : (
    <Loading />
  );
};

export default Announcements;
