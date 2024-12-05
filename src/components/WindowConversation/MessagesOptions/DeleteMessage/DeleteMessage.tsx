import React, { useState } from "react";
import "./DeleteMessage.css";

import { deleteMessage } from "../../../../constants/ConfirmationMessage";
import { MessageType } from "../../../../typescript/types";
import { deleteMessageForEveryone, deleteMessageForUser } from "../../../../api/message";
import { useUserContext } from "../../../../constants/context";
import { useMessagesContext } from "../../../../constants/context";
import { updateDeletedMsg } from "../../../../functions/updateMessage";
function DeleteMessage({ message, closeModal }: { message: MessageType; closeModal: () => void }) {
  const { user } = useUserContext();
  const { setMessages } = useMessagesContext();
  const [checkBoxValue, setCheckBoxValue] = useState<"All" | "Me">("All");

  const submitDeleteMessage = async () => {
    if (!message._id || !user) return;
    console.log(checkBoxValue);

    if (checkBoxValue === "All") {
      //delete all messages
      console.log("ICICICICICICICI");
      const res = await deleteMessageForEveryone(message._id, user._id, user.userName);
      if (res) {
        updateDeletedMsg(message._id, setMessages);
        closeModal();
      }
    } else if (checkBoxValue === "Me") {
      //delete only my messages
      const res = await deleteMessageForUser(message._id, user._id, user.userName);
      if (res) {
        updateDeletedMsgByUser(message._id);
        closeModal();
      }
    }
  };

  const updateDeletedMsgByUser = (messageId: string) => {
    if (!user) return;
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  return (
    <div className="delete-message" onClick={(e) => e.stopPropagation()}>
      <label>
        {" "}
        <input
          type="checkbox"
          name="delete-message-all"
          id="delete-message-all"
          className="delete-message-checkbox"
          value={"All"}
          checked={checkBoxValue === "All"}
          onChange={(e) => setCheckBoxValue(e.target.value as "All" | "Me")}
        />
        <div className="delete-message-text">
          {" "}
          <div className="delete-message-option-title">{deleteMessage.deleteAll.title}</div>
          <div className="delete-message-option-text">{deleteMessage.deleteAll.text}</div>
        </div>
      </label>
      <label>
        <input
          type="checkbox"
          name="delete-message-me"
          id="delete-message-me"
          className="delete-message-checkbox"
          value="Me"
          checked={checkBoxValue === "Me"}
          onChange={(e) => setCheckBoxValue(e.target.value as "All" | "Me")}
        />
        <div className="delete-message-text">
          <div className="delete-message-option-title">{deleteMessage.deleteMe.title}</div>
          <div className="delete-message-option-text">{deleteMessage.deleteMe.text}</div>
        </div>
      </label>
      <div className="mute-conversation-btns-container">
        {" "}
        <button className="cancel-button confirmation-modal-btn" onClick={closeModal}>
          Annuler
        </button>
        <button className="confirm-button confirmation-modal-btn" onClick={submitDeleteMessage}>
          Confirmer
        </button>
      </div>
    </div>
  );
}

export default DeleteMessage;
