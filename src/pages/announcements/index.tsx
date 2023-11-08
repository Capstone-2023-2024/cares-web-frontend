import { useRouter } from "next/router";
import { useEffect } from "react";
import MonthlyActivities from "~/components/Announcements/MonthlyActivities";
import PostForm from "~/components/Announcements/PostForm";
import ToggleWrapper from "~/components/Announcements/ToggleWrapper";
import Button from "~/components/Button";
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
      <div className="flex flex-row justify-between">
        <Button
          primary
          rounded
          disabled={showCalendar}
          onClick={handlePrev}
          text="prev"
        />
        <div className="flex items-center justify-center gap-2 text-center text-xl font-semibold capitalize">
          <h2>{`${monthName} ${year}`}</h2>
        </div>
        <Button
          primary
          rounded
          disabled={showCalendar}
          onClick={handleNext}
          text="next"
        />
      </div>
      <div className="relative h-[70vh]">
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
