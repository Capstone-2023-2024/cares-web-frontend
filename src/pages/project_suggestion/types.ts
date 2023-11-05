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

export interface EventProps
  extends Pick<StateProps, "type" | "state" | "options" | "question"> {
  votes?: Record<string, string>;
  dateOfExpiration: number;
  dateCreated: number;
}
