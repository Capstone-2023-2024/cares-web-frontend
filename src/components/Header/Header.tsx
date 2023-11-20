import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { icon, imageDimension } from "~/utils/image";
import { projectName } from "~/utils/names";
import Nav from "../Nav/Nav";
import { useToggle } from "~/contexts/ToggleContext";

const Header = () => {
  const router = useRouter();
  const { toggleNav } = useToggle();

  return (
    <header className="mt-0 flex w-full justify-between bg-primary p-4 text-paper shadow-md">
      <button onClick={() => void router.push("/dashboard")} className="w-max">
        <Image
          alt="cares_icon"
          src="/cares_icon.png"
          className="inline-block h-8 w-8 brightness-0 invert "
          {...imageDimension(icon)}
        />
        <h1 className="inline-block p-2 align-middle text-lg font-bold uppercase">
          {projectName}
        </h1>
      </button>
      <div className="sm:hidden">
        <Nav />
      </div>
      <button className="sm:hidden" onClick={() => toggleNav(true)}>
        <Image
          alt="cares_icon"
          src="/ellipsis.png"
          className="inline-block h-8 w-8 brightness-0 invert"
          {...imageDimension(icon)}
        />
      </button>
    </header>
  );
};

export default Header;
