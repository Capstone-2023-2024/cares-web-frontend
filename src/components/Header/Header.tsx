import Image from "next/image";
import React from "react";
import { icon, imageDimension } from "~/utils/image";
import { projectName } from "~/utils/names";

const Header = () => {
  return (
    <header className="w-full bg-primary p-4 text-paper shadow-md">
      <section className="flex flex-row items-center gap-4">
        <Image
          alt="cares_icon"
          src="/cares_icon.png"
          className="h-8 w-8 brightness-0 invert"
          {...imageDimension(icon)}
        />
        <h1 className="text-lg font-bold uppercase">{projectName}</h1>
      </section>
    </header>
  );
};

export default Header;
