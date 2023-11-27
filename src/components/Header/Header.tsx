import Image from "next/image";
import { useRouter } from "next/router";
import React, { type MouseEvent, useRef, useState } from "react";
import { imageDimension } from "@cares/utils/media";
import { ICON } from "~/utils/media";
import { projectName } from "@cares/utils/config";
import Nav from "../Nav/Nav";
import { useToggle } from "~/contexts/ToggleProvider";

const Header = () => {
  const router = useRouter();
  const pRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState({
    clientX: 0,
    clientY: 0,
  });
  const { toggleNav } = useToggle();

  const pX = pRef.current?.offsetWidth ?? -1;
  const pY = pRef.current?.offsetHeight ?? -1;
  const poffX = pRef.current?.offsetLeft ?? -1;
  const poffY = pRef.current?.offsetTop ?? -1;

  function divMouseEvent() {
    const parent = pRef.current?.parentElement;

    if (parent !== null && parent !== undefined) {
      const caresContainer = parent.querySelector("#cares-button");
      caresContainer?.classList.toggle("text-paper");
      caresContainer?.classList.toggle("text-primary");
      caresContainer?.firstElementChild?.classList.toggle("brightness-0");
      caresContainer?.firstElementChild?.classList.toggle("invert");
      // pRef.current?.classList.toggle("bg-transparent");
    }
  }
  function divMouseMove(event: MouseEvent<HTMLDivElement>) {
    const mouse = event as unknown as MouseEvent;
    const div = event.currentTarget;
    const clientX = mouse.pageX - div.offsetLeft - poffX - pX / 2;
    const clientY = mouse.pageY - div.offsetTop - poffY - pY / 2;

    setState((prevState) => ({ ...prevState, clientX, clientY }));
  }

  return (
    <header
      onMouseEnter={divMouseEvent}
      onMouseLeave={divMouseEvent}
      onMouseMove={divMouseMove}
      className="relative z-10 mt-0 flex w-full justify-between overflow-hidden bg-primary p-4 text-paper shadow-md duration-300 ease-in-out hover:bg-transparent"
    >
      <div
        className="absolute -z-10 h-48 w-48 rounded-full bg-primary"
        ref={pRef}
        style={{
          mask: "linear-gradient(#000, #0005)",
          top: state.clientX === 0 ? -window.innerWidth : 0,
          left: state.clientY === 0 ? -window.innerHeight : 0,
          transform: `translate(${state.clientX}px,${state.clientY}px)`,
          WebkitMask: "linear-gradient(#000, #0005)",
          transformOrigin: `${state.clientX}, ${state.clientY}`,
          animationDuration: "300ms",
        }}
      />
      <button
        id="cares-button"
        onClick={() => void router.push("/dashboard")}
        className="w-max text-paper"
      >
        <Image
          alt="cares_ICON"
          src="/cares_ICON.png"
          className="inline-block h-8 w-8 brightness-0 invert"
          {...imageDimension(ICON)}
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
          alt="cares_ICON"
          src="/ellipsis.png"
          className="inline-block h-8 w-8 brightness-0 invert"
          {...imageDimension(ICON)}
        />
      </button>
    </header>
  );
};

export default Header;
