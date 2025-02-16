import { deleteMessage } from "../constants/ConfirmationMessage";
import { ConversationType, MessageType } from "../typescript/types";
export const updateDeletedMsg = (
  message: MessageType,
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) => {
  console.log("UPDATE DELETED MESSAGE CALLED");

  const newMsg: MessageType = {
    ...message,
    deletedForEveryone: true,
    text: [deleteMessage.deletedMessage],
    date: new Date(message.date),
    deletedForEveryoneDate: new Date(),
  };
  console.log(newMsg);
  setMessages((prev) =>
    prev.map((msg) => {
      if (msg._id === message._id) {
        return newMsg;
      } else {
        return msg;
      }
    })
  );
};

export const updateConvLastMsgDelete = (
  message: MessageType,
  setConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>
) => {
  const newMsg: MessageType = {
    ...message,
    deletedForEveryone: true,
    text: [deleteMessage.deletedMessage],
    date: new Date(message.date),
  };
  console.log("----------------");
  setConversations((prev) =>
    prev.map((conv) => {
      //console.log(conv._id, message.conversationId, conv.lastMessage._id, message._id);
      if (conv._id === message.conversationId && conv.lastMessage._id === message._id) {
        console.log(
          "update du dernier msg xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        );
        console.log(conv.lastMessage);
        return { ...conv, lastMessage: newMsg };
      } else {
        return conv;
      }
    })
  );
};

export const updateMsgReactions = (
  messageId: string,
  reactions: MessageType["reactions"],
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) => {
  setMessages((prev) =>
    prev.map((msg) => {
      if (msg._id === messageId) {
        return {
          ...msg,
          reactions: reactions,
        };
      } else {
        return msg;
      }
    })
  );
};

export const updateRemoveMsgReaction = (
  messageId: string,
  userId: string,
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) => {
  setMessages((prev) =>
    prev.map((msg) => {
      if (msg._id === messageId) {
        return {
          ...msg,
          reactions: msg.reactions?.filter((reaction) => reaction.userId !== userId),
        };
      } else {
        return msg;
      }
    })
  );
};

export const updateMsgText = (
  messageId: string,
  newText: string,
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) => {
  setMessages((prev) =>
    prev.map((msg) => {
      if (msg._id === messageId) {
        return {
          ...msg,
          text: [...msg.text, newText],
        };
      } else {
        return msg;
      }
    })
  );
};

export const updateConvLastMsgEdited = (
  message: MessageType,
  setConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>
) => {
  setConversations((prev) =>
    prev.map((conv) => {
      if (conv._id === message.conversationId && conv.lastMessage._id === message._id) {
        return { ...conv, lastMessage: message };
      } else {
        return conv;
      }
    })
  );
};
