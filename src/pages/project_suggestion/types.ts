interface OptionProps {
  value: string;
  vote?: number;
}

export interface StateProps {
  options: OptionProps[];
  text: string;
  question: string;
}

export type StateValues =
  | StateProps["options"]
  | StateProps["text"]
  | StateProps["question"];

export interface EventProps {
  type: "poll";
  question: string;
  options: OptionProps[];
  dateCreated: number;
}
