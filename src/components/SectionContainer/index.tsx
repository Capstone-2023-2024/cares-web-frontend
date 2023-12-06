import React, { useState } from "react";
import type {
  SectionContainerProps,
  SectionContainerStateProps,
  SectionContainerStateValue,
} from "./types";
import PermissionCategoryButton from "../PermissionCategoryButton";
import Image from "next/image";
import { imageDimension } from "@cares/common/utils/media";

const SectionContainer = ({
  children,
  extensionName,
}: SectionContainerProps) => {
  const iniState: SectionContainerStateProps = {
    toggleContainer: false,
  };
  const [state, setState] = useState(iniState);

  function handleState(
    key: keyof SectionContainerStateProps,
    value: SectionContainerStateValue,
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function toggleContainer() {
    handleState("toggleContainer", !state.toggleContainer);
  }

  return (
    <section className="h-fit w-full p-2 text-center">
      <PermissionCategoryButton>
        <h2 className="text-xl font-bold uppercase">{extensionName}</h2>
        <button onClick={toggleContainer}>
          <Image
            alt=""
            src="/down.png"
            className={`${
              state.toggleContainer ? "rotate-180" : "rotate-360"
            } h-8 w-8 invert duration-300 ease-in-out hover:scale-110`}
            {...imageDimension(48)}
          />
        </button>
      </PermissionCategoryButton>
      <div className="overflow-y-auto">{state.toggleContainer && children}</div>
    </section>
  );
};

export default SectionContainer;
