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
  status: StatusType;
  blockedUsers: BlockedUsersType[];
};

export type BlockedUsersType = {
  _id?: string;
  userId: string;
  dates: { start: Date; end: Date }[];
};

export type ConversationType = {
  _id: string;
  isGroupConversation: boolean;
  members: ConversationMemberType[];
  admin: string[];
  photo: string;
  lastMessage: MessageType;
  creationDate: Date;
  removedMembers: RemovedMembersType[];
  customization: CustomizationType;
};

export type MessageType = {
  author: string;
  authorId: string;
  text: string[];
  seenBy: SeenByType[];
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
  seenBy: SeenByType[];
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
export type SeenByType = {
  username: string;
  userId: string;
  seenDate: Date;
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
  userId: string;
  messageId: string | undefined;
  seenByDate: Date;
};

export type CustomizationType = {
  conversationName: string;
  photo: string;
  theme: string;
  emoji: string;
};

export type Date15minDifference = {
  isMoreThan15Minutes: boolean;
  hours: string;
  minutes: string;
  date: Date;
};

export type MediasType = {
  _id: string;
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
  isTyping: boolean;
  _id: string; // idk why it appears when i don't add it
};

export type RemovedMembersType = {
  userId: string;
  username: string;
  photo: string;
  date: Date;
};

export type StatusType = "Online" | "Offline" | "Busy";

export type ImgS3DataType = {
  _id: string;
  src: string;
  fileName: string;
  convId?: string;
  lastModified: Date;
};

export type ThumbnailsImgType = {
  _id: string;
  fileName: string;
  src: string;
  lastModified: Date;
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

export type RecentConversationsContextType = {
  recentConversations: ConversationType[] | null;
  setRecentConversations: React.Dispatch<React.SetStateAction<ConversationType[] | null>>;
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

export type AddedMembersContextType = {
  addedMembers: string[];
  setAddedMembers: React.Dispatch<React.SetStateAction<string[]>>;
};

export type HasMoreMsgContextType = {
  hasMoreOlder: boolean;
  setHasMoreOlder: React.Dispatch<React.SetStateAction<boolean>>;
  hasMoreNewer: boolean;
  setHasMoreNewer: React.Dispatch<React.SetStateAction<boolean>>;
};

export type BlockedConvsContextType = {
  blockedConversations: ConversationType[];
  setBlockedConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>;
};
