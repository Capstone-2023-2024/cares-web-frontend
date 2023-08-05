import React, { type ReactNode } from "react";
import Header from "./Header";
import Nav from "./Nav";
import HeaderPath from "./HeaderPath";

interface MainType {
  children: ReactNode;
}

const Main = ({ children }: MainType) => {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex">
        <Nav />
        <div className="flex flex-1 flex-col">
          <HeaderPath />
          <div className="h-full text-charcoal">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Main;
