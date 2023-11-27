import type { DateProps } from "@cares/types/date";
import { calendarArray, currentMonth, currentWeekDay } from "@cares/utils/date";
import React, { useState } from "react";
import { useDate } from "~/contexts/DateProvider";
import { useToggle } from "~/contexts/ToggleProvider";

const noValue = -1;

function baseStyle({
  currentDate,
  month,
  year,
}: {
  currentDate: number;
  month: number;
  year: number;
}) {
  const style = "duration-300 ease-in-out h-full text-right select-none";
  const todayParsed = new Date();
  const selectedDate = new Date();
  // const exactMonthTime = 0;
  // const afterMonthTime = 2678400000;
  const getDateToday = currentDate === new Date().getDate() && currentDate;

  if (typeof getDateToday === "number") {
    todayParsed.setDate(getDateToday);
    selectedDate.setDate(getDateToday);
  }
  selectedDate.setMonth(month);
  selectedDate.setFullYear(year);

  if (currentDate === noValue) return `${style} text-transparent`;
  return `${style}`;
}

const Map = ({ month, year }: Omit<DateProps, "date">) => {
  const selectedMonth = currentMonth({ month, year });
  const maxDays = selectedMonth !== undefined ? selectedMonth.maxDays : -1;
  const { value } = currentWeekDay({ date: 1, month, year });
  const dateMap = calendarArray({ ...value, maxDays });
  const { toggleCalendar, showCalendar } = useToggle();
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
    currentDate: number,
  ) {
    event.preventDefault();
    setSelectedDates([currentDate]);
    setEnableSelection(true);
  }

  function handleMouseUp(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setEnableSelection(false);
    console.log(selectedDates);
    changeSelectedDateArray(selectedDates);
    setSelectedDates([]);
    toggleCalendar();
  }

  function handleMouseOver(
    event: React.MouseEvent<HTMLButtonElement>,
    currentDate: number,
  ) {
    event.preventDefault();
    currentDate > 0 &&
      isSelectionEnable &&
      setSelectedDates((prevState) => {
        const valueSort = (a: number, b: number) => a - b;
        const holder = prevState.sort(valueSort);
        const { firstChild, lastChild } = arrayFirstLastChild(prevState);

        if (firstChild < currentDate && lastChild + 1 === currentDate) {
          holder.push(currentDate);
        }
        return [...new Set(holder)].sort(valueSort);
      });
  }

  return (
    <div className="grid grid-cols-7 text-center">
      {dateMap.map(({ currentDate }, index) => {
        const isOverNoValue = currentDate > noValue;
        const arrayContainsSelectedDate = selectedDates.filter(
          (value) => value === currentDate,
        )[0];
        return (
          <button
            key={index}
            disabled={!isOverNoValue || showCalendar}
            onMouseDown={(e) => handleMouseDown(e, currentDate)}
            onMouseUp={handleMouseUp}
            onMouseOver={(e) => handleMouseOver(e, currentDate)}
            className={`${
              arrayContainsSelectedDate ? "shadow-md" : ""
            } sm:h-26 duration-300 ease-in-out`}
          >
            <p
              className={`${baseStyle({
                currentDate,
                month,
                year,
              })} ${
                arrayContainsSelectedDate
                  ? "bg-blue-400 text-white"
                  : "bg-gray-100 p-6"
              } ${currentDate > noValue ? "text-black" : ""} p-4`}
            >
              {currentDate}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default Map;
