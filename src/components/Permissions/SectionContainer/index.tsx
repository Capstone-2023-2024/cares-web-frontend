import React, { useState } from "react";
import type {
  SectionContainerProps,
  SectionContainerStateProps,
  SectionContainerStateValue,
} from "./types";
import PermissionCategoryButton from "../PermissionCategoryButton";

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
    value: SectionContainerStateValue
  ) {
    setState((prevState) => ({ ...prevState, [key]: value }));
  }

  function toggleContainer() {
    handleState("toggleContainer", !state.toggleContainer);
  }

  return (
    <section className="h-fit w-full  p-2 text-center">
      <PermissionCategoryButton onClick={toggleContainer}>
        <h2 className="text-xl font-bold uppercase">{extensionName}</h2>
        <p>{state.toggleContainer ? "up" : "down"}</p>
      </PermissionCategoryButton>
      <div className="overflow-y-auto">{state.toggleContainer && children}</div>
    </section>
  );
};

export default SectionContainer;
