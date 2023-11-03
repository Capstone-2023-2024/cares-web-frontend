import type { HTMLAttributes } from "react";
import { PostFormStateProps } from "../types";

export interface AnnouncementTypesSelectionProps
  extends HTMLAttributes<HTMLSelectElement> {
  value: PostFormStateProps["type"];
  required?: boolean;
}
