import { MutableRefObject } from "react";

export type UserDataType = {
  _id: string;
  mail: string;
  userName: string;
  socketId: string | undefined;
  photo: string | undefined;
  conversations: string[];
  mutedConversations: Array<{
    conversationId: string;
    untilDate: Date;
  }>;
  deletedConversations: Array<{
    conversationId: string;
    deleteDate: Date;
  }>;
  isOnline: boolean;
  lastSeen: Date;
  status: string;
};

export type ConversationType = {
  _id: string;
  isGroupConversation: boolean;
  members: ConversationMemberType[];
  admin: string[];
  photo: string;
  lastMessage: MessageType;
  creationDate: Date;
  removedMembers: {
    username: string;
    removedData: Date;
  };
  customization: {
    conversationName: string;
    photo: string;
    theme: string;
    emoji: string;
  };
  partnerInfos?: {
    username: string;
    userId: string;
    photo: string;
    isOnline: boolean;
    status: StatusType;
    lastSeen: Date;
  };
};

export type displayedConvContextType = {
  displayedConv: ConversationType | null;
  setDisplayedConv: React.Dispatch<React.SetStateAction<ConversationType | null>>;
};

export type MostRecentContextType = {
  mostRecentConv: ConversationType | null;
  setMostRecentConv: React.Dispatch<React.SetStateAction<ConversationType | null>>;
};

export type TriggerContextType = {
  trigger: boolean | null;
  setTrigger: React.Dispatch<React.SetStateAction<boolean | null>>;
};

export type MessagesContextType = {
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
};

export type ImgS3DataType = {
  src: string;
  name: string;
  convId?: string;
};

export type RecentConversationsContextType = {
  recentConversations: ConversationType[] | null;
  setRecentConversations: React.Dispatch<React.SetStateAction<ConversationType[] | null>>;
};

export type MessageType = {
  author: string;
  authorId: string;
  text: string[];
  seenBy: (string | undefined)[];
  date: Date;
  conversationId: string | undefined;
  _id?: string;
  deletedBy?: DeletedByType[];
  deletedForEveryone?: boolean;
  deletedForEveryoneDate?: Date | null;
  reactions?: Array<{
    username: string;
    userId: string;
    reaction: string;
  }>;
  responseToMsgId: QuotedMessageType | null;
};
export type PostMessageType = {
  author: string;
  authorId: string;
  text: string[];
  seenBy: (string | undefined)[];
  date: Date;
  conversationId: string | undefined;
  deletedBy?: Array<{
    username: string;
    userId: string;
  }>;
  deletedForEveryone?: boolean;
  deletedForEveryoneDate?: Date | null;
  reactions?: Array<{
    username: string;
    userId: string;
    reaction: string;
  }>;
  responseToMsgId: string | null;
};

export type QuotedMessageType = {
  _id: string;
  author: string;
  authorId: string;
  text: string[];
  date: Date;
  conversationId: string;
  deletedBy: DeletedByType[];
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

export type UserDataContextType = {
  user: UserDataType | null;
  setUser: React.Dispatch<React.SetStateAction<UserDataType | null>>;
};
export type SideBarPropsType = {
  setShowConversationWindow: React.Dispatch<React.SetStateAction<boolean>>;
};

export type selectedMessageContextType = {
  selectedFoundMsgId: string;
  setSelectedFoundMsgId: React.Dispatch<React.SetStateAction<string>>;
};

export type ConversationFilesContextType = {
  filesCtxt: MediasType[];
  setFilesCtxt: React.Dispatch<React.SetStateAction<MediasType[]>>;
};

export type ConversationMediasContextType = {
  mediasCtxt: MediasType[];
  setMediasCtxt: React.Dispatch<React.SetStateAction<MediasType[]>>;
};

export type ConversationContextType = {
  conversations: ConversationType[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>;
};

export type MessagesRefContextType = {
  messagesRef: MutableRefObject<{ [key: string]: React.RefObject<HTMLDivElement> }>;
};

export type MediasType = {
  Key: string;
  LastModified: Date;
  Size: number;
  Url: string;
};

export type ConfirmationModalPropsType = {
  title: string;
  text: string | JSX.Element;
  action: () => void;
  closeModal: () => void;
  width?: string;
};

export type DeletedByType = {
  username: string;
  userId: string;
};

export type ConversationMemberType = {
  userId: string;
  username: string;
  nickname: string;
  photo: string;
  status: StatusType;
  isOnline: boolean;
  lastSeen: Date;
  _id: string; // idk why it appears when i don't add it
};

type StatusType = "Online" | "Offline" | "Busy";
