import React, { useState, useEffect } from "react";
import type { TickingClockProps } from "./types";

const TickingClock = ({ expiration, title }: TickingClockProps) => {
  const resetTimer = -28800000;
  const currentDate = new Date();
  currentDate.setTime(resetTimer);
  const [time, setTime] = useState(currentDate);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const dateNow = new Date();
      dateNow.setTime(expiration - (dateNow.getTime() - resetTimer));
      setTime(dateNow);
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [expiration, resetTimer]);

  const date = time.getDate() - 1;
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  return (
    <div className="m-2 mx-auto w-1/3 rounded-lg bg-secondary p-2">
      <p className="font-bold capitalize text-paper">{title}</p>
      <div className="flex flex-row">
        <p className="text-paper">{date < 10 ? `0${date}` : date}:</p>
        <p className="text-paper">{hours < 10 ? `0${hours}` : hours}:</p>
        <p className="text-paper">{minutes < 10 ? `0${minutes}` : minutes}:</p>
        <p className="text-paper">{seconds < 10 ? `0${seconds}` : seconds}</p>
      </div>
    </div>
  );
};

export default TickingClock;
