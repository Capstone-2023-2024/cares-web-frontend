export interface MayorProps {
  id: string;
  email: string;
  name: string;
  section: "a" | "b" | "c" | "d" | "e" | "f" | "g";
  year: number;
  yearLevel: string;
  status?: "active";
}
