import React from "react";
import "./EditedMsgHistory.css";
import { MessageType } from "../../typescript/types";

function EditedMsgHistory({ message }: { message: MessageType }) {
  const texts = message.text;
  return (
    <div className="edited-msg-history">
      <ul>
        {texts.toReversed().map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

export default EditedMsgHistory;
