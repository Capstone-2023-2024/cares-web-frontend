import { currentMonth } from "@cares/utils/date";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MonthlyActivities from "~/components/Announcements/MonthlyActivities";
import PostForm from "~/components/Announcements/PostForm";
import ToggleWrapper from "~/components/Announcements/ToggleWrapper";
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
      <div className="flex flex-col items-center">
        <p className="mt-10 text-center"></p>

        <div className=" w-2/5 rounded-2xl bg-gray-300 p-3 px-40">
          <div className="flex items-center justify-center gap-2 text-center text-3xl font-bold capitalize text-gray-800">
            <h2>{`${monthName} ${year}`}</h2>
          </div>
        </div>
      </div>
      <div className="ml-6 mr-6 mt-4 flex flex-row items-center justify-between">
        <Button
          primary
          rounded
          disabled={showCalendar}
          onClick={handlePrev}
          text="prev"
        />
        <Button
          primary
          rounded
          disabled={showCalendar}
          onClick={handleNext}
          text="next"
        />
      </div>
      <div className="relative mt-2 h-[70vh]">
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
