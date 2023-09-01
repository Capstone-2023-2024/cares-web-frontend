import type { CalendarInArrayType, DateType, WeekNameType } from "shared/types";

export function currentMonth({ month, year }: Omit<DateType, "date">) {
  const months = [
    { name: "january", maxDays: 31 },
    { name: "february", maxDays: year % 4 === 0 ? 29 : 28 },
    { name: "march", maxDays: 31 },
    { name: "april", maxDays: 30 },
    { name: "may", maxDays: 31 },
    { name: "june", maxDays: 30 },
    { name: "july", maxDays: 31 },
    { name: "august", maxDays: 31 },
    { name: "september", maxDays: 30 },
    { name: "october", maxDays: 31 },
    { name: "november", maxDays: 30 },
    { name: "december", maxDays: 31 },
  ];

  return months[month];
}
export function currentWeekDay(props: DateType, weekNames: WeekNameType[]) {
  const date = new Date();
  date.setDate(props.date ?? 1);
  date.setMonth(props.month);
  date.setFullYear(props.year);

  return {
    name: weekNames[date.getDay()],
    value: { week: date.getDay(), today: date.getDate() },
  };
}
export function calendarInArray(props: CalendarInArrayType) {
  const datePosition: { today: number; week: number }[] = [];
  const maxLength = 42;
  const week = props.week;
  let weekPlaceHolder = props.week;

  const checkWeek = (weekProps: number) => {
    if (weekProps + 1 === 7) return (weekPlaceHolder = 0);
    return weekProps + 1;
  };

  /* Push Dates */
  for (let x = 0; x < props.maxDays; x++) {
    datePosition.push({
      today: props.today + x,
      week: checkWeek(weekPlaceHolder - 1),
    });
    weekPlaceHolder += 1;
  }

  /* Push Filler Dates */
  for (let y = week; y > 0; y--) {
    datePosition.unshift({ today: -1, week: -1 });
  }
  /* Check Divisible by 7 */
  while (datePosition.length % 7 !== 0 || datePosition.length !== maxLength) {
    datePosition.push({ today: -1, week: -1 });
  }
  return datePosition;
}
export const weekNames: WeekNameType[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
