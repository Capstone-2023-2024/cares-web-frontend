import { useRouter } from "next/router";
import React from "react";

const HeaderPath = () => {
  const { pathname } = useRouter();

  return (
    <div className="h-min w-full bg-paper p-2 shadow-md">
      <h1 className="text-2xl font-semibold capitalize text-charcoal">
        {pathname.substring(1, pathname.length)}
      </h1>
    </div>
  );
};

export default HeaderPath;
