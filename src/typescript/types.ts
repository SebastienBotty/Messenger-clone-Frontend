export type ConversationType = {
  name: string;
  photo: string;
  lastMessage: MessageType;
};

export type MessageType = {
  author: string;
  text: string;
  seen_by: string[];
  date: Date;
};

export type DateDifference = {
  isMoreThan15Minutes: boolean;
  hours: string;
  minutes: string;
};
