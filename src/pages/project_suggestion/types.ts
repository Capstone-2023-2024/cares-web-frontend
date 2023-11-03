interface OptionProps {
  value: string;
  vote?: number;
}

export interface StateProps {
  type: "poll";
  state: "unpublished" | "published";
  days: number | null;
  options: OptionProps[];
  text: string;
  question: string;
}

export type StateValues =
  | StateProps["days"]
  | StateProps["options"]
  | StateProps["text"]
  | StateProps["question"];

export interface EventProps
  extends Pick<StateProps, "type" | "state" | "options" | "question"> {
    votes?: {[x: string]: string};
  dateOfExpiration: number;
  dateCreated: number;
}
