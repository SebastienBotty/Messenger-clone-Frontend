import React, { createContext, useContext } from "react";
import {
  MessagesContextType,
  MessageType,
  selctedMessageContextType,
} from "../typescript/types";

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
  selctedMessageContextType | undefined
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
