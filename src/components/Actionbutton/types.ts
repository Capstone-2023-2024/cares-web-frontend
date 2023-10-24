import type { HTMLAttributes } from "react";

export interface ActionButtonProps extends HTMLAttributes<HTMLButtonElement> {
  text: string;
  disabled?: boolean;
  color: "yellow" | "red" | "green" | "default";
  src?: string;
}
