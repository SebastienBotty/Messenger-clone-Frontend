import React, { useEffect, useState } from "react";
import { CheckmarkCircleOutline, Close } from "react-ionicons";
import { MessageType } from "../../../../typescript/types";

import "./EditingMsgFooter.css";
import { useDisplayedConvContext } from "../../../../screens/userLoggedIn/userLoggedIn";
import { editTextMessage } from "../../../../api/message";
import {
  useConversationsContext,
  useMessagesContext,
  useUserContext,
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
  const [inputMessage, setInputMessage] = useState<string>(message.text[message.text.length - 1]);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [validEdit, setValidEdit] = useState<boolean>(false);

  const adjustTextareaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      const maxHeight = "10vh";
      textarea.style.height = "auto"; // Réinitialiser la hauteur
      const newHeight = textarea.scrollHeight; // Obtenir la hauteur du contenu
      textarea.style.height = `${newHeight}px`; // Appliquer la nouvelle hauteur

      // Convertir la hauteur en pourcentage (par rapport à la hauteur du parent)
      const parentHeight = textarea.parentElement?.clientHeight || 0;
      const newHeightPercentage = (newHeight / parentHeight) * 100;

      // Appeler la fonction du parent pour mettre à jour les hauteurs
      onTextAreaResize(newHeightPercentage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && inputMessage.trim() != "" && !event.shiftKey) {
      event.preventDefault();
      editMsg();
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    if (e.target.value.trim() != "" && e.target.value !== message.text[message.text.length - 1]) {
      setValidEdit(true);
    } else {
      setValidEdit(false);
    }
  };
  const editMsg = async () => {
    if (!message._id || !displayedConv || !user) return;
    const editedMsg = await editTextMessage(
      message._id,
      inputMessage.trim(),
      user._id,
      user.userName
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
      textarea.setSelectionRange(textarea.value.length, textarea.value.length); //Place the focus at the end of the text

      textarea.addEventListener("input", adjustTextareaHeight);
      return () => textarea.removeEventListener("input", adjustTextareaHeight);
    }
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
            rows={3}
            onKeyDown={handleKeyDown}
            ref={textAreaRef}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleValueChange(e)}
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
