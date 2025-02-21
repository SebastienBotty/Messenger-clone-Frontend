import React from "react";

import { ArrowUndo, AttachOutline } from "react-ionicons";
import "./QuotedMessage.css";
import { QuotedMessageType } from "../../../typescript/types";
import { useUserContext } from "../../../constants/context";
import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";

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
  const { displayedConv } = useDisplayedConvContext();
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

  const renderQuotedMessageText = () => {
    if (!quotedMessage || !displayedConv) return null;
    const text = quotedMessage.text[quotedMessage.text.length - 1];
    if (text.startsWith("GIF/" + displayedConv._id + ":")) {
      return <span>GIF</span>;
    } else if (text.startsWith("PATHIMAGE/" + displayedConv._id + ":")) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <AttachOutline /> <span>Pièce jointe </span>
        </div>
      );
    }
    return <span>text</span>;
  };
  return (
    <div className="quoted-message-container">
      <div className="quoted-message-info">
        {" "}
        <ArrowUndo height={"0.8125rem"} width={"0.8125rem"} color={"#65676b"} /> {msgInfoTxt()}
      </div>
      <div className="quoted-message-text" onClick={() => goToMessage(quotedMessage._id)}>
        {renderQuotedMessageText()}
      </div>
    </div>
  );
}

export default QuotedMessage;
