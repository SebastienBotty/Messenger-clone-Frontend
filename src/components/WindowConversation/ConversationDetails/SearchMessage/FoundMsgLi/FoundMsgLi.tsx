import React, { useContext } from "react";
import { MessageType } from "../../../../../typescript/types";
import { timeSince } from "../../../../../functions/time";

import "./FoundMsgLi.css";
import {
  useMessagesContext,
  useSelectedFoundMsgIdContext,
  useUserContext,
  useMessagesRefContext,
  useHasMoreContext,
} from "../../../../../constants/context";
import { fetchMessagesBeforeAndAfter } from "../../../../../api/message";
import { isMsgInMessages } from "../../../../../functions/updateMessage";
import { useDisplayedConvContext } from "../../../../../screens/userLoggedIn/userLoggedIn";
import { getNickNameById } from "../../../../../functions/StrFormatter";
import ProfilePic from "../../../../Utiles/ProfilePic/ProfilePic";

function FoundMsgLi({
  msg,
  key,
  word,
  memberPhoto,
}: {
  msg: MessageType;
  key: string | undefined;
  word: string;
  memberPhoto: string;
}) {
  const { user, setUser } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const { messages, setMessages } = useMessagesContext();
  const { setSelectedFoundMsgId } = useSelectedFoundMsgIdContext();
  const { messagesRef } = useMessagesRefContext();
  const { setHasMoreOlder, setHasMoreNewer } = useHasMoreContext();

  const extractSurroundingText = (phrase: string, mot: string): JSX.Element => {
    const indexMot = phrase.search(new RegExp(mot, "i"));

    // Si le mot n'est pas trouvé, retourne la phrase originale
    if (indexMot === -1) {
      return <span>{phrase}</span>;
    }

    // Définir les limites pour 10 caractères avant et après le mot
    const startIndex = Math.max(0, indexMot - 15);
    const endIndex = Math.min(phrase.length, indexMot + mot.length + 15);

    // Extraire les parties avant et après le mot
    const beforeText =
      startIndex > 0
        ? "..." + phrase.slice(startIndex, indexMot)
        : phrase.slice(startIndex, indexMot);
    const afterText =
      endIndex < phrase.length
        ? phrase.slice(indexMot + mot.length, endIndex) + "..."
        : phrase.slice(indexMot + mot.length, endIndex);

    // Combiner et retourner la chaîne complète
    return (
      <span className="surrounding-text">
        {beforeText}
        <strong>{mot}</strong>
        {afterText}
      </span>
    );
  };

  const handleMsgClick = async (msg: MessageType) => {
    if (!msg._id || !user?._id || !msg.conversationId) return;
    if (!isMsgInMessages(msg, messages)) {
      const beforeAndAfterMsg = await fetchMessagesBeforeAndAfter(
        msg._id,
        msg.conversationId,
        user._id
      );
      if (beforeAndAfterMsg) {
        const messagesAround = [...beforeAndAfterMsg[0].reverse(), msg, ...beforeAndAfterMsg[1]];
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
      }
    }
    if (messagesRef.current && messagesRef.current[msg._id]?.current) {
      setTimeout(() => {
        if (!msg._id) return;
        messagesRef.current[msg._id].current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
    setSelectedFoundMsgId(msg._id);
  };

  //Fetches messages before and after a selected message
  if (!displayedConv) return null;
  return (
    <li key={key} className="found-msg" onClick={() => handleMsgClick(msg)}>
      <div className="found-msg-user-img">
        <div className="found-msg-user-img-container">
          <ProfilePic
            picSrc={memberPhoto}
            status={"Online"} // We don't care about the data we put there
            isGroupConversationPic={false}
            showStatus={false}
          />
        </div>
      </div>
      <div className="found-msg-content">
        <div className="found-msg-username">
          {displayedConv.members.some((member) => member.username === msg.authorId)
            ? getNickNameById(displayedConv.members, msg.authorId)
            : msg.author}
        </div>
        <div className="found-msg-details">
          <div className="found-msg-text">
            <div className="trunc-text">
              {" "}
              {extractSurroundingText(msg.text[msg.text.length - 1], word)}
            </div>
          </div>
          <div className="found-msg-time-since">- {timeSince(new Date(msg.date))}</div>
        </div>
      </div>
    </li>
  );
}

export default FoundMsgLi;
