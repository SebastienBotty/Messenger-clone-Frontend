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

function MessagesOptions({
  message,
  setEditingMsg,
  editingMsg,
  setQuotedMessage,
}: {
  message: MessageType;
  setEditingMsg?: React.Dispatch<React.SetStateAction<MessageType | null>>;
  editingMsg: MessageType | null;
  setQuotedMessage: React.Dispatch<React.SetStateAction<QuotedMessageType | null>>;
}) {
  const { user } = useUserContext();
  const { messages, setMessages } = useMessagesContext();
  const { setConversations } = useConversationsContext();
  const isImg =
    message.text[message.text.length - 1].startsWith("PATHIMAGE/" + message.conversationId + ":") ||
    message.text[message.text.length - 1].startsWith("GIF/" + message.conversationId + ":");
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [showReactPicker, setShowReactPicker] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

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
    // Vérifier si le clic est à l'extérieur des trois options
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
    // Ajouter l'écouteur global pour les clics à l'extérieur
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Nettoyer l'écouteur à la destruction du composant
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const toggleMoreOptions = () => {
    // Si MoreOptions est déjà ouvert, on ferme les autres menus
    if (showMoreOptions) {
      setShowMoreOptions(false);
    } else {
      setShowMoreOptions(true);
      setShowReactPicker(false); // Fermer reactPicker
      setShowEmojiPicker(false); // Fermer emojiPicker
    }
  };

  const toggleReactPicker = () => {
    // Si ReactPicker est déjà ouvert, on ferme les autres menus
    if (showReactPicker) {
      setShowReactPicker(false);
    } else {
      setShowReactPicker(true);
      setShowMoreOptions(false); // Fermer moreOptions
      setShowEmojiPicker(false); // Fermer emojiPicker
    }
  };

  const toggleEmojiPicker = () => {
    // Si emojiPicker est déjà ouvert, on ferme les autres menus
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
      console.log("test");
    } else {
      setShowEmojiPicker(true);
      setShowMoreOptions(false); // Fermer moreOptions
    }
  };

  const openConfirmationModal = (eventName: string) => {
    if (!user || !message._id) return;
    switch (eventName) {
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
      console.log(emoji);
      updateMsgReactions(message._id, req, setMessages);
      setShowReactPicker(false);
    }
  };

  const editMessage = async () => {
    if (!message._id || !setEditingMsg) return;
    setEditingMsg(message);
    console.log("set editingMsgId: " + message._id);
  };

  const openRespondMsg = () => {
    if (!message?._id || !message.conversationId) return null;

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

    return () => {};
  }, [message.reactions]);

  return (
    <div className="message-options" onClick={(e) => e.stopPropagation()}>
      <div className="icons">
        <div className="icon" ref={moreOptionsRef}>
          <EllipsisVertical title={"Plus"} onClick={toggleMoreOptions} color={"#65676b"} />
          {showMoreOptions && (
            <div className="message-more-options">
              <ul className="message-more-options-ul">
                {!moreThanXmins(message.date, 10) &&
                  setEditingMsg &&
                  !isImg &&
                  !message.deletedForEveryone && (
                    <li className="message-more-options-li" onClick={editMessage}>
                      Modifier
                    </li>
                  )}{" "}
                {!editingMsg && (
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
                  <li className="message-more-options-li">Transférer</li>
                )}
              </ul>
            </div>
          )}
          {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
        </div>
        {!message.deletedForEveryone && (
          <>
            <div className="icon">
              <ArrowUndo title={"Répondre"} color={"#65676b"} onClick={() => openRespondMsg()} />
            </div>
            <div className="icon" ref={reactPickerRef}>
              <HappyOutline title={"Réagir"} onClick={toggleReactPicker} color={"#65676b"} />
              {showReactPicker && (
                <div className="reactions-container">
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
                      <div className="reactions-emoji-picker" onClick={(e) => e.stopPropagation()}>
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
