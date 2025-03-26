import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ConfirmationModalPropsType,
  MessageType,
  QuotedMessageType,
} from "../../../typescript/types";
import { Add, ArrowUndo, EllipsisVertical, HappyOutline } from "react-ionicons";

import "./MessagesOptions.css";
import { deleteMessage } from "../../../constants/ConfirmationMessage";
import DeleteMessage from "./DeleteMessage/DeleteMessage";
import ConfirmationModal from "../../Utiles/ConfirmationModal/ConfirmationModal";
import {
  useBlockedConvsContext,
  useConversationsContext,
  useMessagesContext,
  useUserContext,
} from "../../../constants/context";
import { changeMsgReaction, deleteMessageForUser, removeMsgReaction } from "../../../api/message";
import EmojiPicker from "emoji-picker-react";
import {
  updateDeletedMsgByUser,
  updateMsgReactions,
  updateRemoveMsgReaction,
} from "../../../functions/updateMessage";
import { moreThanXmins } from "../../../functions/time";
import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";
import { isPrivateConvBlocked } from "../../../functions/conversation";

function MessagesOptions({
  message,
  setEditingMsg,
  editingMsg,
  setQuotedMessage,
  quotedMessage,
}: {
  message: MessageType;
  setEditingMsg?: React.Dispatch<React.SetStateAction<MessageType | null>>;
  editingMsg: MessageType | null;
  setQuotedMessage: React.Dispatch<React.SetStateAction<QuotedMessageType | null>>;
  quotedMessage: QuotedMessageType | null;
}) {
  const { user } = useUserContext();
  const { messages, setMessages } = useMessagesContext();
  const { setConversations } = useConversationsContext();
  const { displayedConv } = useDisplayedConvContext();
  const { blockedConversations } = useBlockedConvsContext();

  const isImg =
    message.text[message.text.length - 1].startsWith("PATHIMAGE/" + message.conversationId + ":") ||
    message.text[message.text.length - 1].startsWith("GIF/" + message.conversationId + ":");
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [showReactPicker, setShowReactPicker] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");

  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const reactPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
    width: "",
  });

  const reactions = ["❤️", "😲", "😂", "😡", "👍", "👎"];

  const isUserAuthor = message.author === user?.userName;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      moreOptionsRef.current &&
      !moreOptionsRef.current.contains(event.target as Node) &&
      reactPickerRef.current &&
      !reactPickerRef.current.contains(event.target as Node) &&
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target as Node)
    ) {
      setShowMoreOptions(false);
      setShowReactPicker(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (
      (moreOptionsRef.current && showMoreOptions) ||
      (reactPickerRef.current && showReactPicker)
    ) {
      const ref = showMoreOptions ? moreOptionsRef.current : reactPickerRef.current;
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const isInTopHalf = rect.top < windowHeight / 2;

        setMenuPosition(isInTopHalf ? "bottom" : "top");
      }
    }
  }, [showMoreOptions, showReactPicker]);

  const toggleMoreOptions = () => {
    if (showMoreOptions) {
      setShowMoreOptions(false);
    } else {
      setShowMoreOptions(true);
      setShowReactPicker(false);
      setShowEmojiPicker(false);
    }
  };

  const toggleReactPicker = () => {
    if (showReactPicker) {
      setShowReactPicker(false);
    } else {
      setShowReactPicker(true);
      setShowMoreOptions(false);
      setShowEmojiPicker(false);
    }
  };

  const toggleEmojiPicker = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    } else {
      setShowEmojiPicker(true);
      setShowMoreOptions(false);
    }
  };

  const openConfirmationModal = (eventName: string) => {
    if (!user || !message._id) return;
    let newEventName = eventName;
    console.log(newEventName);
    if (
      eventName === "deleteUserMsg" &&
      displayedConv?._id &&
      isPrivateConvBlocked(displayedConv?._id, blockedConversations)
    ) {
      newEventName = "deleteMsgOther";
    }
    console.log(newEventName);

    switch (newEventName) {
      case "deleteUserMsg":
        setConfirmationModalProps({
          title: deleteMessage.title,
          text: (
            <DeleteMessage message={message} closeModal={() => setShowConfirmationModal(false)} />
          ),
          action: () => {},
          closeModal: () => setShowConfirmationModal(false),
          width: "40vw",
        });
        break;
      case "deleteMsgOther":
        setConfirmationModalProps({
          title: deleteMessage.title,
          text: deleteMessage.deleteMe.text,
          action: async () => {
            const req = await deleteMessageForUser(message._id, user._id, user.userName);
            if (req) {
              if (!message._id) return;

              updateDeletedMsgByUser(
                message._id,
                user._id,
                user.userName,
                messages,
                setMessages,
                setConversations
              );
              setShowConfirmationModal(false);
            }
          },
          closeModal: () => setShowConfirmationModal(false),
          width: "40vw",
        });
        break;
    }

    setShowConfirmationModal(true);
  };

  const handleEmojiClick = async (emoji: string) => {
    if (!message._id || !user) return;
    if (emoji === selectedEmoji) {
      const req = await removeMsgReaction(message._id, user._id, user.userName);
      if (req) {
        setSelectedEmoji("");
        updateRemoveMsgReaction(message._id, user._id, setMessages);
        setShowReactPicker(false);
      }
      return;
    }
    const req = await changeMsgReaction(message._id, emoji, user._id, user.userName);
    if (req) {
      setSelectedEmoji(emoji);
      updateMsgReactions(message._id, req, setMessages);
      setShowReactPicker(false);
    }
  };

  const editMessage = async () => {
    if (!message._id || !setEditingMsg) return;
    setShowMoreOptions(false);
    setEditingMsg(message);
  };

  const openRespondMsg = () => {
    if (!message?._id || !message.conversationId || editingMsg) return null;

    setQuotedMessage({
      _id: message._id,
      author: message.author,
      authorId: message.authorId,
      text: message.text,
      date: message.date,
      conversationId: message.conversationId,
      deletedBy: [],
    });
  };

  useEffect(() => {
    if (message.reactions) {
      setSelectedEmoji(message.reactions.find((r) => r.userId === user?._id)?.reaction || "");
    }
  }, [message.reactions]);

  return (
    <div className="message-options" onClick={(e) => e.stopPropagation()}>
      <div className="icons">
        <div className="icon" ref={moreOptionsRef}>
          <EllipsisVertical title={"Plus"} onClick={toggleMoreOptions} color={"#65676b"} />
          {showMoreOptions && (
            <div
              className={`message-more-options ${
                menuPosition === "top" ? "menu-top" : "menu-bottom"
              }`}
            >
              <ul className="message-more-options-ul">
                {!moreThanXmins(message.date, 10) &&
                  setEditingMsg &&
                  !isImg &&
                  !message.deletedForEveryone &&
                  quotedMessage === null && (
                    <li className="message-more-options-li" onClick={editMessage}>
                      Modifier
                    </li>
                  )}{" "}
                {!editingMsg && !quotedMessage && (
                  <li
                    className="message-more-options-li"
                    onClick={() =>
                      isUserAuthor
                        ? openConfirmationModal("deleteUserMsg")
                        : openConfirmationModal("deleteMsgOther")
                    }
                  >
                    {isUserAuthor ? "Retirer" : "Supprimer"}
                  </li>
                )}
                {!message.deletedForEveryone && (
                  <li className="message-more-options-li" onClick={() => alert("Not implemented")}>
                    Transférer
                  </li>
                )}
              </ul>
            </div>
          )}
          {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
        </div>
        {!message.deletedForEveryone &&
          displayedConv?._id &&
          !isPrivateConvBlocked(displayedConv?._id, blockedConversations) && (
            <>
              <div className="icon">
                <ArrowUndo title={"Répondre"} color={"#65676b"} onClick={() => openRespondMsg()} />
              </div>
              <div className="icon" ref={reactPickerRef}>
                <HappyOutline title={"Réagir"} onClick={toggleReactPicker} color={"#65676b"} />
                {showReactPicker && (
                  <div
                    className={`reactions-container ${
                      menuPosition === "top" ? "menu-top" : "menu-bottom"
                    }`}
                  >
                    {reactions.map((reaction) => (
                      <div
                        className={`reaction ${selectedEmoji === reaction && "selected-emoji"}`}
                        onClick={() => handleEmojiClick(reaction)}
                      >
                        {reaction}
                      </div>
                    ))}
                    <div className="reaction icon" ref={emojiPickerRef} onClick={toggleEmojiPicker}>
                      <Add />
                      {showEmojiPicker && (
                        <div
                          className={`reactions-emoji-picker ${
                            menuPosition === "top" ? "menu-top" : "menu-bottom"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EmojiPicker onEmojiClick={(e) => handleEmojiClick(e.emoji)} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}

export default MessagesOptions;
