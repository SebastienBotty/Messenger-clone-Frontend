export type ConversationType = {
  _id: string;
  isGroupConversation: boolean;
  members: string[];
  admin: string[];
  photo: string;
  lastMessage: MessageType;
  creationDate: Date;
  removedMembers: RemovedMembersType[];
  customization: {
    conversationName: string;
    photo: string;
    theme: string;
    emoji: string;
  };
  partnerInfos?: {
    username: string;
    photo: string;
    status: "Online" | "Offline" | "Busy";
    lastSeen: Date;
  };
};
export type RemovedMembersType = {
  username: string;
  removedData: Date;
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
  isOnline: boolean;
  lastSeen: Date;
  status: string;
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

export type MediasType = {
  Key: string;
  LastModified: Date;
  Size: number;
  Url: string;
};
