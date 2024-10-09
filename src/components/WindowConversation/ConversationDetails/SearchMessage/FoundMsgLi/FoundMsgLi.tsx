import React, { useContext } from "react";
import { MessageType } from "../../../../../typescript/types";
import { timeSince } from "../../../../../functions/time";

import "./FoundMsgLi.css";
import { ApiToken } from "../../../../../localStorage";
import { UserContext } from "../../../../../screens/userLoggedIn/userLoggedIn";
import { before } from "lodash";
import { useMessagesContext } from "../../../../../constants/context";

function FoundMsgLi({
  msg,
  key,
  word,
}: {
  msg: MessageType;
  key: string | undefined;
  word: string;
}) {
  const apiUrl = process.env.REACT_APP_REST_API_URI;
  const user = useContext(UserContext);

  const { messages, setMessages } = useMessagesContext();

  const extractSurroundingText = (phrase: string, mot: string): JSX.Element => {
    const indexMot = phrase.indexOf(mot);

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
      <span>
        {beforeText}
        <strong>{mot}</strong>
        {afterText}
      </span>
    );
  };

  const handleMsgClick = async (msg: MessageType) => {
    const beforeAndAfterMsg = await fetchMessagesBeforeAndAfter(msg);

    if (beforeAndAfterMsg) {
      console.log("oui");
      const messagesAround = [
        ...beforeAndAfterMsg[0].reverse(),
        msg,
        ...beforeAndAfterMsg[1],
      ];
      console.log(messagesAround);

      console.log(messages);

      setMessages([]); //No idea why it is not working when i instantly setMessages(messagesAround)  but it does if i setMessages([]) then timeout and setMessages(messagesAround)
      setTimeout(() => {
        setMessages(messagesAround);
      }, 500);
    }
  };

  //Fetches messages before and after a selected message
  const fetchMessagesBeforeAndAfter = async (
    msg: MessageType
  ): Promise<[MessageType[], MessageType[]] | false> => {
    if (!user) return false;
    try {
      const response = await fetch(
        apiUrl +
          "/message/userId/" +
          user._id +
          "/getMessagesBeforeAndAfter?conversationId=" +
          msg.conversationId +
          "&messageId=" +
          msg._id,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${ApiToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lor du fetch");
      }
      const jsonData = await response.json();
      return jsonData;
      console.log(jsonData);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return false;
    }
  };

  return (
    <li key={key} className="found-msg" onClick={() => handleMsgClick(msg)}>
      <div className="found-msg-user-img">
        <div className="found-msg-user-img-container"></div>
      </div>
      <div className="found-msg-content">
        <div className="found-msg-username">{msg.author}</div>
        <div className="found-msg-details">
          <div className="found-msg-text">
            <div className="trunc-text">
              {" "}
              {extractSurroundingText(msg.text, word)}
            </div>
          </div>
          <div className="found-msg-time-since">
            - {timeSince(new Date(msg.date))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default FoundMsgLi;
