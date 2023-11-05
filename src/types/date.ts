export type WeekNameType =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface DateType {
  date?: number;
  month: number;
  year: number;
}

export interface CalendarInArrayType {
  week: number;
  today: number;
  maxDays: number;
}
