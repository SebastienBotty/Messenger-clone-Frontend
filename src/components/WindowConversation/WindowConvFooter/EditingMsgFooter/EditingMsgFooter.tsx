import React, { useContext, useEffect, useState } from "react";
import { CheckmarkCircleOutline, Close } from "react-ionicons";
import { MessageType } from "../../../../typescript/types";

import "./EditingMsgFooter.css";
import { useDisplayedConvContext } from "../../../../screens/userLoggedIn/userLoggedIn";
import { editTextMessage } from "../../../../api/message";
import {
  useConversationsContext,
  useMessagesContext,
  useUserContext,
  useMessagesRefContext,
} from "../../../../constants/context";
import { updateConvLastMsgEdited, updateMsgText } from "../../../../functions/updateMessage";

function EditingMsgFooter({
  message,
  setEditingMsg,
  onTextAreaResize,
  height,
}: {
  message: MessageType;
  setEditingMsg: React.Dispatch<React.SetStateAction<MessageType | null>>;
  onTextAreaResize: (newTextareaHeight: number) => void;
  height: string;
}) {
  const { displayedConv } = useDisplayedConvContext();
  const { user } = useUserContext();
  const { setMessages } = useMessagesContext();
  const { setConversations } = useConversationsContext();
  const { messagesRef } = useMessagesRefContext();
  const [inputMessage, setInputMessage] = useState<string>(message.text[message.text.length - 1]);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [validEdit, setValidEdit] = useState<boolean>(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(0);

  const adjustTextareaHeight = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    // Sauvegarde la position du curseur
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Réinitialise complètement la hauteur
    textarea.style.height = "auto";

    // Calcul de la hauteur maximale et minimale
    const maxHeight = window.innerHeight * 0.3;
    const minHeight = window.innerHeight * 0.04; // 4vh en pixels

    // Définit la nouvelle hauteur en fonction du contenu
    const scrollHeight = Math.max(textarea.scrollHeight, minHeight);
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Gestion du scroll si le contenu dépasse la hauteur maximale
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";

    // Met à jour la hauteur du footer
    const footerHeightPercentage = (newHeight / window.innerHeight) * 100;
    onTextAreaResize(Math.max(7.5, footerHeightPercentage));

    // Restaure la position du curseur
    textarea.setSelectionRange(selectionStart, selectionEnd);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && inputMessage.trim() != "" && !event.shiftKey) {
      event.preventDefault();
      editMsg();
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();

    if (e.target.value.trim() != "" && e.target.value !== message.text[message.text.length - 1]) {
      setValidEdit(true);
    } else {
      setValidEdit(false);
    }
  };

  const editMsg = async () => {
    if (!message._id || !message.conversationId || !displayedConv || !user || !validEdit) return;
    const editedMsg = await editTextMessage(
      message._id,
      inputMessage.trim(),
      user._id,
      user.userName,
      message.conversationId
    );
    if (editedMsg) {
      setEditingMsg(null);
      updateMsgText(message._id, editedMsg.text[editedMsg.text.length - 1], setMessages);
      updateConvLastMsgEdited(editedMsg, setConversations);
    }
  };

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.focus();
      adjustTextareaHeight();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length); //Place the focus at the end of the text
    }

    // Scroll to the message being edited
    if (message._id && message._id in messagesRef.current) {
      messagesRef.current[message._id]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // Add overlay class to highlight the edited message
    if (message._id && message._id in messagesRef.current) {
      messagesRef.current[message._id]?.current?.classList.add("editing-message-highlight");
    }

    // Add overlay to the conversation container
    const conversationContainer = document.querySelector(".conversation-container");
    if (conversationContainer) {
      const overlay = document.createElement("div");
      overlay.className = "editingMsgOverlay";
      conversationContainer.appendChild(overlay);
    }

    return () => {
      // Remove highlight class when component unmounts
      if (message._id && message._id in messagesRef.current) {
        messagesRef.current[message._id]?.current?.classList.remove("editing-message-highlight");
      }

      // Remove overlay
      const overlay = document.querySelector(".editingMsgOverlay");
      if (overlay) {
        overlay.remove();
      }
    };
  }, []);

  return (
    <div className="editing-msg-footer" style={{ height: height }}>
      <div className="editing-msg-header">
        <span>Modifier le message</span>
        <div className="close-icon">
          {" "}
          <Close color={"#00000"} height="3vh" width="3vh" onClick={() => setEditingMsg(null)} />
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div className="message-input" style={inputMessage ? { flex: "auto" } : {}}>
          <textarea
            className="send-message"
            placeholder="Aa"
            value={inputMessage}
            onKeyDown={handleKeyDown}
            ref={textAreaRef}
            onChange={handleValueChange}
            style={{
              minHeight: "4vh",
              maxHeight: "30vh",
              resize: "none",
            }}
          />
        </div>
        <div className="like-icon">
          {validEdit ? (
            <div className="allowed-click">
              <CheckmarkCircleOutline
                color={displayedConv?.customization.theme}
                height="3vh"
                width="3vh"
                onClick={() => editMsg()}
              />
            </div>
          ) : (
            <div className="disabled-click">
              <CheckmarkCircleOutline color={"lightgray"} height="3vh" width="3vh" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditingMsgFooter;
