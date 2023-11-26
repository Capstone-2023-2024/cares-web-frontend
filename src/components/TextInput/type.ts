import type { HTMLAttributes } from "react";

interface TextInputProps extends HTMLAttributes<HTMLInputElement> {
  id: string;
  type: "email" | "password" | "text";
  name?: string;
  value: string;
  condition: boolean;
  required?: boolean;
  background?: string;
}

export type { TextInputProps };
