import type { HTMLAttributes, ReactNode } from "react";

export interface ButtonType extends HTMLAttributes<HTMLButtonElement> {
  text?: string;
  primary?: boolean;
  error?: boolean;
  success?: boolean;
  type?: "reset" | "submit" | "button";
  rounded?: boolean;
  children?: ReactNode;
}
