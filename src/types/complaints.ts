export interface DocumentProps {
  files: string[];
}
export interface WriteConcernBaseProps extends Partial<DocumentProps> {
  message: string;
  sender: string;
  timestamp: number;
}
export interface WriteConcernProps {
  dateCreated: number;
  recipient: "mayor" | "adviser" | "program_chair" | "board_member";
  messages: WriteConcernBaseProps[];
  status: "processing" | "resolved" | "turn-over";
  studentNo: string;
  turnOvers?: number;
  referenceId?: string;
}
export interface ReadConcernProps extends WriteConcernProps {
  id: string;
}
export interface ReadConcernBaseProps extends WriteConcernBaseProps {
  id: string;
}
