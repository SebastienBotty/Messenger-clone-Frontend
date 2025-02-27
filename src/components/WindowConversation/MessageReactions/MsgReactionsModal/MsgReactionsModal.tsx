import React, { useState } from "react";
import { MessageType } from "../../../../typescript/types";
import ProfilePic from "../../../Utiles/ProfilePic/ProfilePic";
import "./MsgReactionsModal.css";
import { useMessagesContext, useUserContext } from "../../../../constants/context";
import { removeMsgReaction } from "../../../../api/message";
import { updateRemoveMsgReaction } from "../../../../functions/updateMessage";

function MsgReactionsModal({
  reactionsArr,
  messageId,
  closeModal,
}: {
  reactionsArr: MessageType["reactions"];
  messageId: string;
  closeModal: () => void;
}) {
  const { user } = useUserContext();
  const { setMessages } = useMessagesContext();
  const [selectedType, setSelectedType] = useState<string>("");
  console.log("oOUIFRZOGZOGHZ");
  console.log(messageId);
  if (!reactionsArr) return null;

  const countReactions = (reactions: MessageType["reactions"]) => {
    if (!reactions) return null;
    return reactions.reduce<Record<string, number>>((acc, { reaction }) => {
      acc[reaction] = (acc[reaction] || 0) + 1;
      return acc;
    }, {});
  };

  const createEmojiTableHeader = (reactsArr: MessageType["reactions"]) => {
    const nbReacts = countReactions(reactsArr);
    const keys = nbReacts ? Object.keys(nbReacts) : []; // Vérifie si `result` est non nul
    const values = nbReacts ? Object.values(nbReacts) : []; // Vérifie si `result` est non nul

    let result: React.ReactNode[] = [];

    for (let i = 0; i < keys.length; i++) {
      result.push(
        <div
          className={`medias-title ${selectedType === keys[i] ? "selected-type" : ""} `}
          key={values[i]}
          onClick={() => setSelectedType(keys[i])}
        >
          <span className="emoji-header">{keys[i]}</span>
          <span className="emoji-header-number"> ({values[i]}) </span>
        </div>
      );
    }
    return result;
  };

  const createTableEmojiBottomBar = (reactsArr: MessageType["reactions"]) => {
    const nbReacts = countReactions(reactsArr);
    const keys = nbReacts ? Object.keys(nbReacts) : []; // Vérifie si `result` est non nul

    let result: React.ReactNode[] = [];
    result.push(
      <div className="medias-title-bottom-bar-container" key="bottom-bar">
        <div
          className={`medias-title-bottom-bar ${selectedType === "" ? "selected-type" : ""}`}
          onClick={() => setSelectedType("")}
        ></div>
        {keys.map((key, i) => (
          <div
            className={`medias-title-bottom-bar ${selectedType === keys[i] ? "selected-type" : ""}`}
            key={`footer-${key}`}
            onClick={() => setSelectedType(keys[i])}
          ></div>
        ))}
      </div>
    );
    return result;
  };

  const removeReaction = async () => {
    if (!user) return;
    console.log("ICICICICICIC");
    console.log(messageId);
    const req = await removeMsgReaction(messageId, user._id, user.userName);
    if (req) {
      updateRemoveMsgReaction(messageId, user._id, setMessages);
      closeModal();
    }
  };
  if (!user) return null;
  return (
    <div className="msg-reactions-modal">
      <div className="conv-media">
        <div className="conv-media-header">
          <div className="medias-title-container">
            <div
              className={`medias-title ${selectedType === "" ? "selected-type" : ""}`}
              onClick={() => setSelectedType("")}
            >
              <h4>Tout ({reactionsArr.length > 0 && reactionsArr.length})</h4>
            </div>
            {createEmojiTableHeader(reactionsArr)}
          </div>
          {createTableEmojiBottomBar(reactionsArr)}
        </div>
      </div>
      <div className="msg-reactions-modal-list">
        <ul>
          {selectedType
            ? reactionsArr
                .filter((reaction) => reaction.reaction === selectedType)
                .map((usr) => {
                  const isMe = usr.userId === user?._id;
                  return (
                    <li
                      key={usr.userId}
                      className={`msg-reactions-user-li-container ${
                        isMe ? "msg-reactions-user-li-container-me" : ""
                      }`}
                      onClick={isMe ? removeReaction : () => {}}
                    >
                      <div className="msg-reactions-user-pic">
                        <ProfilePic
                          picSrc={user.photo}
                          status={user.status}
                          isOnline={user.isOnline}
                          isGroupConversationPic={false}
                        />
                      </div>
                      <div className="msg-reactions-username">
                        {" "}
                        <div className="msg-reactions-username-text">{usr.username}</div>
                      </div>
                      <div className="msg-reactions-user-reaction">{usr.reaction}</div>
                    </li>
                  );
                })
            : reactionsArr.map((usr) => {
                const isMe = usr.userId === user?._id;
                return (
                  <li
                    key={usr.userId}
                    className={`msg-reactions-user-li-container ${
                      isMe ? "msg-reactions-user-li-container-me" : ""
                    }`}
                    onClick={isMe ? removeReaction : () => {}}
                  >
                    <div className="msg-reactions-user-pic">
                      <ProfilePic
                        picSrc={user.photo}
                        status={user.status}
                        isOnline={user.isOnline}
                        isGroupConversationPic={false}
                      />
                    </div>
                    <div className="msg-reactions-username">
                      <div className="msg-reactions-username-text">{usr.username}</div>
                      {isMe && (
                        <div className="msg-reactions-username-click-me">
                          Cliquez pour supprimer
                        </div>
                      )}
                    </div>
                    <div className="msg-reactions-user-reaction">{usr.reaction}</div>
                  </li>
                );
              })}
        </ul>
      </div>
    </div>
  );
}

export default MsgReactionsModal;
