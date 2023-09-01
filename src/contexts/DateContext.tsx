import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { WeekNameType } from "shared/types";
import { currentMonth, weekNames } from "~/utils/date";

interface initialDateType {
  date: number;
  month: number;
  year: number;
  weekName?: WeekNameType;
  selectedDateArray: number[];
  announceNameRef: string;
}
interface DateContextType extends initialDateType {
  changeDate: (date: number) => void;
  changeMonth: (month: number) => void;
  changeYear: (year: number) => void;
  changeWeek: (weekName: WeekNameType) => void;
  changeSelectedDateArray: (dateArray: number[]) => void;
}
interface DateProviderType {
  children: ReactNode;
}

const initDate = new Date();
const initialDate: initialDateType = {
  date: initDate.getDate(),
  month: initDate.getMonth(),
  year: initDate.getFullYear(),
  weekName: weekNames[initDate.getDay()],
  selectedDateArray: [],
  announceNameRef: "",
};

const DateContext = createContext<DateContextType>({
  ...initialDate,
  changeDate: () => null,
  changeMonth: () => null,
  changeYear: () => null,
  changeWeek: () => null,
  changeSelectedDateArray: () => null,
});

const DateProvider = ({ children }: DateProviderType) => {
  const [state, setState] = useState(initialDate);
  const { year, month } = useDate();
  const MONTH = currentMonth({ year, month })?.name.toUpperCase();
  const announceNameRef = `announcement/${MONTH}/${year}`;

  const values = {
    ...state,
    announceNameRef,
    changeDate,
    changeMonth,
    changeYear,
    changeWeek,
    changeSelectedDateArray,
  };

  function handleState(
    name: keyof initialDateType,
    value: number | WeekNameType | number[]
  ) {
    setState((previousState) => ({ ...previousState, [name]: value }));
  }
  function changeDate(date: number) {
    handleState("date", date);
  }
  function changeMonth(month: number) {
    handleState("month", month);
  }
  function changeYear(year: number) {
    handleState("year", year);
  }
  function changeWeek(weekName: WeekNameType) {
    handleState("weekName", weekName);
  }
  function changeSelectedDateArray(dateArray: number[]) {
    handleState("selectedDateArray", dateArray);
  }

  return <DateContext.Provider value={values}>{children}</DateContext.Provider>;
};

export const useDate = () => useContext(DateContext);
export default DateProvider;
