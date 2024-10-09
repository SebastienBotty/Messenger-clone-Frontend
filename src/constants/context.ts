import React, { createContext, useContext } from "react";
import { MessagesContextType, MessageType } from "../typescript/types";

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
