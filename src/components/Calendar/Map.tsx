import React, { useState } from "react";
import {
  calendarInArray,
  currentMonth,
  currentWeekDay,
  weekNames,
} from "~/utils/date";
import type { DateType } from "shared/types";
import { useToggle } from "~/contexts/ToggleContext";
import { useDate } from "~/contexts/DateContext";

const noValue = -1;

function baseStyle({
  today,
  month,
  year,
}: {
  today: number;
  month: number;
  year: number;
}) {
  const style = "duration-300 ease-in-out h-full text-right select-none";
  const todayParsed = new Date();
  const selectedDate = new Date();
  // const exactMonthTime = 0;
  // const afterMonthTime = 2678400000;
  const getDateToday = today === new Date().getDate() && today;

  if (typeof getDateToday === "number") {
    todayParsed.setDate(getDateToday);
    selectedDate.setDate(getDateToday);
  }
  selectedDate.setMonth(month);
  selectedDate.setFullYear(year);

  if (today === noValue) return `${style} text-transparent`;
  return `${style}`;
}

const Map = ({ month, year }: Omit<DateType, "date">) => {
  const selectedMonth = currentMonth({ month, year });
  const maxDays = selectedMonth !== undefined ? selectedMonth.maxDays : -1;
  const { value } = currentWeekDay({ month, year }, weekNames);
  const dateMap = calendarInArray({ ...value, maxDays });
  const { toggleCalendar } = useToggle();
  const { changeSelectedDateArray } = useDate();
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [isSelectionEnable, setEnableSelection] = useState<boolean>(false);

  function arrayFirstLastChild(array: number[]) {
    return {
      firstChild: array[0] ?? noValue,
      lastChild: array[array.length - 1] ?? noValue,
    };
  }

  function handleMouseDown(
    event: React.MouseEvent<HTMLButtonElement>,
    today: number
  ) {
    event.preventDefault();
    setSelectedDates([today]);
    setEnableSelection(true);
  }

  function handleMouseUp(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setEnableSelection(false);
    changeSelectedDateArray(selectedDates);
    toggleCalendar();
  }

  function handleMouseOver(
    event: React.MouseEvent<HTMLButtonElement>,
    today: number
  ) {
    event.preventDefault();
    today > 0 &&
      isSelectionEnable &&
      setSelectedDates((prevState) => {
        const valueSort = (a: number, b: number) => a - b;
        const holder = prevState.sort(valueSort);
        const { firstChild, lastChild } = arrayFirstLastChild(prevState);

        if (firstChild < today && lastChild + 1 === today) {
          holder.push(today);
        }
        return [...new Set(holder)].sort(valueSort);
      });
  }

  return (
    <div className="grid grid-cols-7 text-center">
      {dateMap.map(({ today }, index) => {
        const isOverNoValue = today > noValue;
        const arrayContainsSelectedDate = selectedDates.filter(
          (value) => value === today
        )[0];
        return (
          <button
            disabled={!isOverNoValue}
            onMouseDown={(e) => handleMouseDown(e, today)}
            onMouseUp={handleMouseUp}
            onMouseOver={(e) => handleMouseOver(e, today)}
            className={`${
              arrayContainsSelectedDate ? "border-blue-400 shadow-md" : ""
            } sm:h-26 border duration-300 ease-in-out`}
            key={index}
          >
            <p
              className={`${baseStyle({
                today,
                month,
                year,
              })} ${
                arrayContainsSelectedDate
                  ? "bg-blue-400 text-white"
                  : "bg-transparent"
              } ${today > noValue ? "text-black" : ""} p-2`}
            >
              {today}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default Map;
