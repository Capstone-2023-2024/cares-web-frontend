import { type ReactNode } from "react";

interface ToggleWrapperType {
  children: ReactNode;
  condition: boolean;
}

const ToggleWrapper = ({ condition, children }: ToggleWrapperType) => {
  return (
    <div
      className={`${
        condition
          ? "z-10 translate-y-0 opacity-100"
          : "-z-20 translate-y-32 select-none opacity-0"
      } absolute inset-x-0 duration-300 ease-in-out`}
    >
      {children}
    </div>
  );
};

export default ToggleWrapper;
