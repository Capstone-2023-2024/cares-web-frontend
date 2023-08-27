import { useRouter } from "next/router";
import React from "react";
import type { HeaderPathType } from "~/utils/types";

const HeaderPath = (props: Partial<HeaderPathType>) => {
  const { pathname, push } = useRouter();
  const { moreThanOne } = props;

  return (
    <div
      className={`${
        moreThanOne ? "justify-between" : "justify-start"
      } flex h-min w-full items-center bg-paper p-2 shadow-md`}
    >
      <h1 className="text-2xl font-semibold capitalize text-charcoal">
        {pathname.substring(1, pathname.length).replace(/_/g, " ")}
      </h1>
      {pathname === "/announcements" && (
        <button onClick={() => push(`.${pathname}/calendar`)}>Calendar</button>
      )}
    </div>
  );
};

export default HeaderPath;
