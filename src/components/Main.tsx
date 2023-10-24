import React, { type ReactNode } from "react";
import Header from "./Header";
import Nav from "./Nav";
import HeaderPath from "./HeaderPath";
import type { HeaderPathType } from "~/utils/types";

interface MainType extends Partial<HeaderPathType> {
  children: ReactNode;
  withPathName?: boolean;
}

const Main = ({ children, withPathName, ...rest }: MainType) => {
  return (
    <div>
      <Header />
      <div className="flex h-screen ">
        <Nav />
        <div className="inline-block w-2/3">
          {withPathName && <HeaderPath {...rest} />}
          <div className=" text-charcoal">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Main;
