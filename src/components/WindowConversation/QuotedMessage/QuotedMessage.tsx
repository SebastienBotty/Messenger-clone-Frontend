import React from "react";

import { ArrowUndo, AttachOutline } from "react-ionicons";
import "./QuotedMessage.css";
import { MessageType, QuotedMessageType } from "../../../typescript/types";
import {
  useHasMoreContext,
  useMessagesContext,
  useMessagesRefContext,
  useSelectedFoundMsgIdContext,
  useUserContext,
} from "../../../constants/context";
import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";
import { isMsgInMessages } from "../../../functions/updateMessage";
import { fetchMessagesBeforeAndAfter, getMessageById } from "../../../api/message";
import { getNickNameById } from "../../../functions/StrFormatter";

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
  const { messages, setMessages } = useMessagesContext();
  const { messagesRef } = useMessagesRefContext();
  const { setSelectedFoundMsgId } = useSelectedFoundMsgIdContext();
  const { setHasMoreOlder, setHasMoreNewer } = useHasMoreContext();

  if (!user || typeof quotedMessage === "string" || !quotedMessage) return null;

  const handleQuotedMsgClick = async (msg: QuotedMessageType) => {
    console.log(msg);
    console.log("handleQuotedMsgClick");
    console.log(messagesRef.current);
    if (!msg._id || !user?._id || !displayedConv?._id) return;
    if (!isMsgInMessages(msg, messages)) {
      const beforeAndAfterMsg = await fetchMessagesBeforeAndAfter(
        msg._id,
        msg.conversationId,
        user._id
      );
      const getQuotedMsg: MessageType | false = await getMessageById(
        msg._id,
        displayedConv._id,
        user._id
      );

      if (beforeAndAfterMsg && getQuotedMsg) {
        const messagesAround = [
          ...beforeAndAfterMsg[0].reverse(),
          getQuotedMsg,
          ...beforeAndAfterMsg[1],
        ];
        console.log(messagesAround);

        console.log(messages);

        setMessages([]); //No idea why it is not working when i instantly setMessages(messagesAround)  but it does if i setMessages([]) then timeout and setMessages(messagesAround)
        setTimeout(() => {
          setMessages(messagesAround);
          setTimeout(() => {
            setHasMoreNewer(true);
            setHasMoreOlder(true);
          }, 500);
        }, 500);
        // Gotta repeat this because scroll doesn't work when i setMessages(messagesAround) (probably because it takes time to set Messages and create new Refs) ---- Not full working
        if (messagesRef.current && messagesRef.current[msg._id]?.current) {
          setTimeout(() => {
            messagesRef.current[msg._id].current?.scrollIntoView({ behavior: "smooth" });
          }, 1500);
        }
      }
    } else {
      if (messagesRef.current && messagesRef.current[msg._id]?.current) {
        messagesRef.current[msg._id].current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    setSelectedFoundMsgId(msg._id);
  };
  const msgInfoTxt = () => {
    if (!displayedConv) return "";
    if (currentMsgAuthorId === user._id) {
      //If current msg is from user
      if (quotedMessage.authorId === user._id) {
        //If user reponds his own message
        return "Vous avez répondu à votre propre message";
      } else {
        //If user reponds someone else's message
        return (
          "Vous avez répondu à " + getNickNameById(displayedConv.members, quotedMessage.authorId)
        );
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
    return <span>{text}</span>;
  };
  return (
    <div className="quoted-message-container">
      <div className="quoted-message-info">
        {" "}
        <ArrowUndo height={"0.8125rem"} width={"0.8125rem"} color={"#65676b"} /> {msgInfoTxt()}
      </div>
      <div className="quoted-message-text" onClick={() => handleQuotedMsgClick(quotedMessage)}>
        {renderQuotedMessageText()}
      </div>
    </div>
  );
}

export default QuotedMessage;
