import React from "react";
import { MessageType } from "../../../../../typescript/types";
import { timeSince } from "../../../../../functions/time";

import "./FoundMsgLi.css";

function FoundMsgLi({
  msg,
  key,
  word,
}: {
  msg: MessageType;
  key: string | undefined;
  word: string;
}) {
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

  return (
    <li key={key} className="found-msg">
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
