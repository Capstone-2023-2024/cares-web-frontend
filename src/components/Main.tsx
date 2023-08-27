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
    <div className="flex flex-col">
      <Header />
      <div className="flex">
        <Nav />
        <div className="flex flex-1 flex-col">
          {withPathName && <HeaderPath {...rest} />}
          <div className="h-full text-charcoal">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Main;
