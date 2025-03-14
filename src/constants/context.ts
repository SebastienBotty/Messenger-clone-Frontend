import React, { createContext, useContext } from "react";
import {
  MessagesContextType,
  selectedMessageContextType,
  ConversationFilesContextType,
  ConversationMediasContextType,
  UserDataContextType,
  ConversationContextType,
  MessagesRefContextType,
  AddedMembersContextType,
  HasMoreMsgContextType,
} from "../typescript/types";

//User Context

export const UserContext = createContext<UserDataContextType | null>(null);
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

// Conversations Context
export const ConversationsContext = createContext<ConversationContextType | null>(null);

export const useConversationsContext = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error("useConversationsContext must be used within a ConversationProvider");
  }
  return context;
};

//Messages Context
export const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessagesContext must be used within a MessagesProvider");
  }
  return context;
};

//SELECTED FOUND MSG => When user searchs for a word and find the wanted msg that contains it, its id is stocked here and we can use it to display it

export const SelectedFoundMsgIdContext = createContext<selectedMessageContextType | undefined>(
  undefined
);
export const useSelectedFoundMsgIdContext = () => {
  const context = useContext(SelectedFoundMsgIdContext);
  if (!context) {
    throw new Error("useSelectedFoundMsgContext must be used within a SelectedFoundMsgProvider");
  }
  return context;
};

export const ConversationFilesContext = createContext<ConversationFilesContextType | undefined>(
  undefined
);

export const useConversationFilesContext = () => {
  const context = useContext(ConversationFilesContext);
  if (!context) {
    throw new Error("useConversationFilesContext must be used within a ConversationFilesProvider");
  }
  return context;
};

export const ConversationMediasContext = createContext<ConversationMediasContextType | undefined>(
  undefined
);

export const useConversationMediasContext = () => {
  const context = useContext(ConversationMediasContext);
  if (!context) {
    throw new Error(
      "useConversationMediasContext must be used within a ConversationMediasProvider"
    );
  }
  return context;
};

export const MessagesRefContext = createContext<MessagesRefContextType | undefined>(undefined);

export const useMessagesRefContext = () => {
  const context = useContext(MessagesRefContext);
  if (!context) {
    throw new Error("useMessagesRefContext doit être utilisé dans un MessagesRefProvider");
  }
  return context;
};

export const AddedMembersContext = createContext<AddedMembersContextType | undefined>(undefined);

export const useAddedMembersContext = () => {
  const context = useContext(AddedMembersContext);
  if (!context) {
    throw new Error("useAddedMembersContext must be used within a AddedMembersProvider");
  }
  return context;
};

export const HasMoreContext = createContext<HasMoreMsgContextType | undefined>(undefined);

export const useHasMoreContext = () => {
  const context = useContext(HasMoreContext);
  if (!context) {
    throw new Error("useHasMoreContext doit être utilisé dans un MessagesRefProvider");
  }
  return context;
};
