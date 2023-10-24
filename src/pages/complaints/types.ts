import { HTMLAttributes } from "react";

export interface ChatTextProps {
  text: string;
  condition: boolean;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl";
}
