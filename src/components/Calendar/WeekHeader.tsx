import React from "react";
import { weekNames } from "~/utils/date";

const WeekHeader = () => {
  return (
    <div className="flex flex-1 items-center justify-around text-lg">
      {weekNames.map((value, weekdayIndex) => (
        <div
          className="w-full bg-blue-400 text-white"
          key={weekdayIndex}
          // onClick={() => console.log(weekNames[weekdayIndex])}
        >
          <h1 className="select-none border text-center uppercase">
            {value.substring(0, 3)}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default WeekHeader;
