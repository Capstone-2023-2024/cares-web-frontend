import React from "react";
import { weekNames } from "~/utils/date";

const WeekHeader = () => {
  return (
    <div className="flex flex-1 items-center justify-around text-lg">
      {weekNames.map((value, weekdayIndex) => (
        <button
          className="w-full"
          key={weekdayIndex}
          onClick={() => console.log(weekNames[weekdayIndex])}
        >
          <h1>{value.substring(0, 3)}</h1>
        </button>
      ))}
    </div>
  );
};

export default WeekHeader;
