import React from "react";
import { weekNames } from "@cares/common/utils/date";

const WeekHeader = () => {
  return (
    <div className="flex flex-1 items-center justify-around text-lg">
      {weekNames.map((value, weekdayIndex) => {
        const formattedWeekName = value.substring(0, 3);
        return (
          <div className="w-full bg-primary p-2 text-white" key={weekdayIndex}>
            <h1 className="select-none text-center uppercase">
              {formattedWeekName}
            </h1>
          </div>
        );
      })}
    </div>
  );
};

export default WeekHeader;
