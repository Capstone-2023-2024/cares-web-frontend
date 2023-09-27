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
  const initDate = new Date();
  const { year } = useDate();
  const monthName = currentMonth({
    month: initDate.getMonth(),
    year: initDate.getFullYear(),
  })?.name;

  useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser]);

  return currentUser !== null ? (
    <Main withPathName moreThanOne>
      <div className="flex items-center justify-center gap-2 text-xl font-semibold">
        <h2 className="text-center capitalize">{monthName}</h2>
        <h2 className="text-center capitalize">{year}</h2>
      </div>
      <div className=" relative h-96 overflow-hidden">
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
