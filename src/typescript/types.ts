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
