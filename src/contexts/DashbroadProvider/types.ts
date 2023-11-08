import type { ReactNode } from "react";
import type { AnnouncementProps } from "~/types/announcement";

export interface DashboardStateProps {
  countData: { name: AnnouncementProps["type"]; count: number }[];
}

export interface DashboardContextProps extends DashboardStateProps {
  refreshCountData: () => void;
}

export interface DashboardProviderProps {
  children: ReactNode;
}
