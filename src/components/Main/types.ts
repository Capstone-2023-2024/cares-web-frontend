import type { ReactNode } from "react";
import type { HeaderPathType } from "~/utils/types";

export interface MainType extends Partial<HeaderPathType> {
  children: ReactNode;
  withPathName?: boolean;
}
