import React, { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmationModalPropsType, MessageType } from "../../../typescript/types";
import { ArrowUndo, EllipsisVertical, HappyOutline } from "react-ionicons";

import "./MessagesOptions.css";
import { deleteMessage } from "../../../constants/ConfirmationMessage";
import DeleteMessage from "./DeleteMessage/DeleteMessage";
import ConfirmationModal from "../../Utiles/ConfirmationModal/ConfirmationModal";
import { useMessagesContext, useUserContext } from "../../../constants/context";
import { deleteMessageForUser } from "../../../api/message";

function MessagesOptions({ message }: { message: MessageType }) {
  const { user } = useUserContext();
  const { setMessages } = useMessagesContext();

  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [showReactPicker, setShowReactPicker] = useState<boolean>(false);

  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const reactPickerRef = useRef<HTMLDivElement>(null);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
    width: "",
  });

  const isUserAuthor = message.author === user?.userName;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Vérifier si le clic est à l'extérieur de l'une des deux options
    if (
      moreOptionsRef.current &&
      !moreOptionsRef.current.contains(event.target as Node) &&
      reactPickerRef.current &&
      !reactPickerRef.current.contains(event.target as Node)
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
    // Si MoreOptions est déjà ouvert, on ferme les deux
    if (showMoreOptions) {
      setShowMoreOptions(false);
    } else {
      setShowMoreOptions(true);
      setShowReactPicker(false); // Fermer reactPicker si on ouvre moreOptions
    }
  };

  const toggleReactPicker = () => {
    // Si ReactPicker est déjà ouvert, on ferme les deux
    if (showReactPicker) {
      setShowReactPicker(false);
    } else {
      setShowReactPicker(true);
      setShowMoreOptions(false); // Fermer moreOptions si on ouvre reactPicker
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
            if (req) updateDeletedMsgByUser(message._id);
          },
          closeModal: () => setShowConfirmationModal(false),
          width: "40vw",
        });
        break;
    }

    setShowConfirmationModal(true);
  };
  const updateDeletedMsgByUser = (messageId: string | undefined) => {
    if (!user || !messageId) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              deleteByUser: msg.deletedBy?.push({ userId: user._id, username: user.userName }),
            }
          : msg
      )
    );
  };

  return (
    <div className="message-options">
      <div className="icons">
        <div className="icon" ref={moreOptionsRef}>
          <EllipsisVertical title={"Plus"} onClick={toggleMoreOptions} color={"#65676b"} />
          {showMoreOptions && (
            <div className="message-more-options">
              <ul className="message-more-options-ul">
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
                <li className="message-more-options-li">Transférer</li>
              </ul>
            </div>
          )}
          {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
        </div>
        <div className="icon">
          <ArrowUndo title={"Répondre"} color={"#65676b"} />
        </div>
        <div className="icon" ref={reactPickerRef}>
          <HappyOutline title={"Réagir"} onClick={toggleReactPicker} color={"#65676b"} />
          {showReactPicker && <div className="message-more-options">OUI OUI BAGUETTE</div>}
        </div>
      </div>
    </div>
  );
}

export default MessagesOptions;
