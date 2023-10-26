import type { HTMLAttributes } from "react";

export interface SelectionProps extends HTMLAttributes<HTMLSelectElement> {
  array: string[];
  value: string;
}
