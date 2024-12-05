import { deleteMessage } from "../constants/ConfirmationMessage";
import { MessageType } from "../typescript/types";
export const updateDeletedMsg = (
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) => {
  console.log("UPDATE DELETED MESSAGE CALLED");
  setMessages((prev) =>
    prev.map((msg) => {
      if (msg._id === messageId) {
        console.log("MEME ID ICICICICICIC");
        console.log(msg.deletedForEveryone, msg.text);
        const oui = {
          ...msg,
          deletedForEveryone: true,
          text: deleteMessage.deletedMessage,
        };
        console.log(oui);
        return oui;
      } else {
        return msg;
      }
    })
  );
};
