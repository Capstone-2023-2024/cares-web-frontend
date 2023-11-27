import type { HTMLAttributes } from "react";

interface SelectionProps<T> extends HTMLAttributes<HTMLSelectElement> {
  value: T;
  options: T[];
  disabled?: boolean;
  required?: boolean;
}

export type { SelectionProps };
