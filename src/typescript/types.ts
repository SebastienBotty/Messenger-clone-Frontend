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

export type ShowImgVisualizerContextType = {
  showImgVisualizer: boolean | null;
  setShowImgVisualizer: React.Dispatch<React.SetStateAction<boolean | null>>;
};

export type ImgS3DataType = {
  src: string;
  name: string;
  convId?: string;
};
export type ImgVisualizerInitialImgType = {
  imgData: ImgS3DataType | null;
  setImgData: React.Dispatch<React.SetStateAction<ImgS3DataType | null>>;
};

export type RecentConversationsContextType = {
  recentConversations: ConversationType[] | null;
  setRecentConversations: React.Dispatch<
    React.SetStateAction<ConversationType[] | null>
  >;
};

export type MessageType = {
  author: string | undefined;
  authorId?: string;
  text: string;
  seenBy: (string | undefined)[];
  date: Date;
  conversationId: string | undefined;
  _id?: string;
};

export type LastMsgSeenByMembersType = {
  username: string;
  messageId: string | undefined;
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
export type SideBarPropsType = {
  setShowConversationWindow: React.Dispatch<React.SetStateAction<boolean>>;
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
