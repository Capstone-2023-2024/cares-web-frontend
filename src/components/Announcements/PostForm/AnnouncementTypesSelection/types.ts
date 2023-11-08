import type { HTMLAttributes } from "react";
import type { PostFormStateProps } from "../types";

export interface AnnouncementTypesSelectionProps
  extends HTMLAttributes<HTMLSelectElement> {
  value: PostFormStateProps["type"];
  disabled?: boolean;
  required?: boolean;
}
