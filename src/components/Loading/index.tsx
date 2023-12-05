import React from "react";
import { projectName } from "@cares/common/utils/config";

const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-secondary uppercase">
      <p className="text-3xl text-paper">{projectName}</p>
      <div className="mr-6">
        <BoxContainer />
      </div>
    </div>
  );
};

export const BoxContainer = () => {
  return (
    <div className="grid h-fit items-center justify-center">
      <div className="relative">
        {new Array(4).fill(0).map((v, i) => {
          return <Box delay={i + 1} key={i} />;
        })}
      </div>
    </div>
  );
};

const Box = ({ delay }: { delay: number }) => {
  let baseStyle =
    "absolute z-10 h-6 w-6 animate-loading text-transparent before:content-['.']";
  function getDelay() {
    if (delay === 1) baseStyle += " delay-1";
    else if (delay === 2) baseStyle += " delay-2";
    else if (delay === 3) baseStyle += " delay-3";
    else baseStyle += " delay-4";
    return baseStyle;
  }
  return <div className={`${getDelay()} rounded-full`} />;
};

export default Loading;
