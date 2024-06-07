export type ConversationType = {
  _id: string;
  isGroupConversation: boolean;
  members: string[];
  admin: string[];
  photo: string;
  lastMessage: MessageType;
  creationDate: Date;
};

export type ConversationContextType = {
  displayedConv: ConversationType | null;
  setDisplayedConv: React.Dispatch<
    React.SetStateAction<ConversationType | null>
  >;
};

export type MostRecentContextType = {
  mostRecentConv: ConversationType | null;
  setMostRecentConv: React.Dispatch<
    React.SetStateAction<ConversationType | null>
  >;
};

export type TriggerContextType = {
  trigger: boolean | null;
  setTrigger: React.Dispatch<React.SetStateAction<boolean | null>>;
};
export type MessageType = {
  author: string | undefined;
  authorId?: string;
  text: string;
  seen_by: (string | undefined)[];
  date: Date;
  conversationId: string | undefined;
};

export type Date15minDifference = {
  isMoreThan15Minutes: boolean;
  hours: string;
  minutes: string;
  date: Date;
};

export type NavBarProps = {
  handleSignOut: () => void;
};

export type UserDataType = {
  _id: string;
  mail: string;
  userName: string;
  socketId: string | undefined;
  photo: string | undefined;
  conversations: string[];
};

export const dayNames: string[] = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export const monthNames: string[] = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
