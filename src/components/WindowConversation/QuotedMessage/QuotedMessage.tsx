import React from "react";

import { ArrowUndo } from "react-ionicons";
import "./QuotedMessage.css";
import { QuotedMessageType } from "../../../typescript/types";
import { useUserContext } from "../../../constants/context";

function QuotedMessage({
  quotedMessage,
  currentMsgAuthorId,
  currentMsgAuthor,
}: {
  quotedMessage: QuotedMessageType | string;
  currentMsgAuthorId: string;
  currentMsgAuthor: string;
}) {
  const { user } = useUserContext();
  if (!user || typeof quotedMessage === "string" || !quotedMessage) return null;

  const goToMessage = (messageId: string) => {};
  const msgInfoTxt = () => {
    if (currentMsgAuthorId === user._id) {
      //If current msg is from user
      if (quotedMessage.authorId === user._id) {
        //If user reponds his own message
        return "Vous avez répondu à votre propre message";
      } else {
        //If user reponds someone else's message
        return "Vous avez répondu à " + quotedMessage.author;
      }
    } else {
      //If current msg is from someone else
      if (quotedMessage.authorId === user._id) {
        //If other respondes to user
        return currentMsgAuthor + " vous a répondu";
      } else {
        //If other reponds someone else's message
        return currentMsgAuthor + " a répondu à " + quotedMessage.author;
      }
    }
  };
  return (
    <div className="quoted-message-container">
      <div className="quoted-message-info">
        {" "}
        <ArrowUndo height={"0.8125rem"} width={"0.8125rem"} color={"#65676b"} /> {msgInfoTxt()}
      </div>
      <div className="quoted-message-text" onClick={() => goToMessage(quotedMessage._id)}>
        {quotedMessage.text[quotedMessage.text.length - 1]}
      </div>
    </div>
  );
}

export default QuotedMessage;
