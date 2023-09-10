import { type ReactNode } from "react";

interface ToggleWrapperType {
  children: ReactNode;
  condition: boolean;
}

const ToggleWrapper = ({ condition, children }: ToggleWrapperType) => {
  return (
    <div
      className={`${
        condition ? "translate-x-0 opacity-100" : "translate-x-96 opacity-0 "
      } absolute inset-0 duration-300 ease-in-out`}
    >
      {children}
    </div>
  );
};

export default ToggleWrapper;
