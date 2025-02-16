import React from "react";
import "./EditedMsgHistory.css";
import { MessageType } from "../../typescript/types";

function EditedMsgHistory({ message }: { message: MessageType }) {
  const texts = message.text;
  texts.reverse();
  return (
    <div className="edited-msg-history">
      <ul>
        {texts.map((text: string, index: number) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

export default EditedMsgHistory;
