interface DocumentProps {
  files: string[];
}

export interface ConcernBaseProps extends Partial<DocumentProps> {
  message: string;
  sender: string;
  timestamp: number;
}

export interface ConcernProps {
  dateCreated: number;
  recipient: "mayor" | "adviser" | "program_chair" | "board_member";
  messages: ConcernBaseProps[];
  status: "processing" | "resolved" | "turn-over";
  studentNo: string;
  turnOvers?: number;
}

export interface ChatTextProps {
  text: string;
  condition: boolean;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl";
}
