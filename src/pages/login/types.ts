export interface InitialAuthProps {
  email: string;
  password: string;
}

export type InitialAuthPropsType =
  | InitialAuthProps["email"]
  | InitialAuthProps["password"];
