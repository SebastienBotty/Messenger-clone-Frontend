import React, { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmationModalPropsType, MessageType } from "../../../typescript/types";
import "./MessageReactions.css";
import MsgReactionsModal from "./MsgReactionsModal/MsgReactionsModal";
import ConfirmationModal from "../../Utiles/ConfirmationModal/ConfirmationModal";

function MessageReactions({ message }: { message: MessageType }) {
  const reactionRef = useRef<HTMLDivElement>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
  });

  if (!message.reactions) return <></>;
  if (message.reactions.length < 1) return <></>;

  let reactionsEmoji = [];
  for (const reaction of message.reactions) {
    reactionsEmoji.push(reaction.reaction);
  }
  let uniqueReactions = Array.from(new Set(reactionsEmoji));

  if (uniqueReactions.length > 3) {
    uniqueReactions = uniqueReactions.slice(0, 3);
  }

  const displayNbReactions = () => {
    if (reactionsEmoji.length > 9) {
      return "9+";
    }
    if (reactionsEmoji.length < 2) {
      return <></>;
    }
    return reactionsEmoji.length;
  };

  const displayUsersList = () => {
    if (!message.reactions) return <></>;
    let usersList = [];
    for (const reaction of message.reactions) {
      usersList.push(reaction.username);
    }
    return usersList.map((user) => <li>{user}</li>);
  };

  const handleReactionsClick = () => {
    if (!message._id) return;
    console.log("lalalalalalalal");
    console.log(message._id);
    setConfirmationModalProps({
      title: "Reactions au message",
      text: (
        <MsgReactionsModal
          reactionsArr={message.reactions}
          messageId={message._id}
          closeModal={() => {
            setShowConfirmationModal(false);
          }}
        />
      ),
      action: () => {},
      closeModal: () => {
        setShowConfirmationModal(false);
      },
    });
    setShowConfirmationModal(true);
  };
  return (
    <div
      className="msg-reactions-container"
      ref={reactionRef}
      onClick={() => handleReactionsClick()}
    >
      {uniqueReactions.map((emoji) => emoji)} {displayNbReactions()}
      <div className="msg-reactions-users-list">
        <ul>{displayUsersList()}</ul>
      </div>
      {showConfirmationModal && (
        <div style={{ cursor: "initial" }}>
          <ConfirmationModal {...confirmationModalProps} />
        </div>
      )}
    </div>
  );
}

export default MessageReactions;
