import React from "react";
import { projectName } from "~/utils/names";

const Header = () => {
  return (
    <header className="left-0 top-0 z-10 w-full bg-primary p-2 text-paper">
      <h1 className="font-semibold uppercase">{projectName}</h1>
    </header>
  );
};

export default Header;
