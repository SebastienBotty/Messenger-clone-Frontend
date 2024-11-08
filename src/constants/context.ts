import React, { createContext, useContext } from "react";
import {
  MessagesContextType,
  selectedMessageContextType,
  ConversationFilesContextType,
  ConversationMediasContextType,
  UserDataContextType,
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

//Messages Context
export const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export const useMessagesContext = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error(
      "useMessagesContext must be used within a MessagesProvider"
    );
  }
  return context;
};

//SELECTED FOUND MSG => When user searchs for a word and find the wanted msg that contains it, its id is stocked here and we can use it to display it

export const SelectedFoundMsgIdContext = createContext<
  selectedMessageContextType | undefined
>(undefined);
export const useSelectedFoundMsgIdContext = () => {
  const context = useContext(SelectedFoundMsgIdContext);
  if (!context) {
    throw new Error(
      "useSelectedFoundMsgContext must be used within a SelectedFoundMsgProvider"
    );
  }
  return context;
};

export const ConversationFilesContext = createContext<
  ConversationFilesContextType | undefined
>(undefined);

export const useConversationFilesContext = () => {
  const context = useContext(ConversationFilesContext);
  if (!context) {
    throw new Error(
      "useConversationFilesContext must be used within a ConversationFilesProvider"
    );
  }
  return context;
};

export const ConversationMediasContext = createContext<
  ConversationMediasContextType | undefined
>(undefined);

export const useConversationMediasContext = () => {
  const context = useContext(ConversationMediasContext);
  if (!context) {
    throw new Error(
      "useConversationMediasContext must be used within a ConversationMediasProvider"
    );
  }
  return context;
};
