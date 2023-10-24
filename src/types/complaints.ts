export interface ConcernProps {
    id: string;
    message: string;
    withDocument: boolean;
    sender: string;
    dateCreated: number;
  }
  
  export interface ChatTextProps {
    text: string;
    condition: boolean;
    textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }