import React, { useEffect, useState, useContext, useRef } from "react";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import { useMessagesContext, useUserContext } from "../../../../../constants/context";
import "./ChangeConvName.css";
import { ApiToken } from "../../../../../localStorage";
import { patchConvName } from "../../../../../api/conversation";
function ChangeConvName({ closeModal, text }: { closeModal: () => void; text: string }) {
  const { user, setUser } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { setMessages } = useMessagesContext();
  const [nbCharS, setNbCharS] = useState<number>(0);
  const [value, setValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputTextRef = useRef<HTMLInputElement>(null);
  const maxLength = 30;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setNbCharS(e.target.value.length);
  };

  const changeConvName = async (value: string) => {
    if (!displayedConv || !user) {
      setErrorMsg("Une erreur est survenue, rafraichissement de la page dans 5 sec");
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      return;
    }
    if (!value || value === "") {
      setErrorMsg("Veuillez entrer un nom de conversation valide");
      return;
    }

    if (value.length > maxLength) {
      setErrorMsg("Le nom de conversation doit avoir moins de 30 caractères");
      return;
    }
    if (value === displayedConv?.customization.conversationName) {
      setErrorMsg("La conversation porte déja ce nom");
      return;
    }
    const response = await patchConvName(displayedConv._id, value, user._id);
    if (response) {
      setDisplayedConv(response.conversation);
      setMostRecentConv(response.conversation);
      setMessages((prev) => {
        return [...prev, response.conversation.lastMessage];
      });
      closeModal();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      changeConvName(value);
    }
  };

  useEffect(() => {
    if (displayedConv?.customization.conversationName) {
      setNbCharS(displayedConv.customization.conversationName.length);
      setValue(displayedConv.customization.conversationName);
      setIsFocused(true);
    }
    if (inputTextRef.current) {
      inputTextRef.current.focus();
    }
    return () => {};
  }, []);
  if (!displayedConv || !user) {
    console.log("y a r");
    return null;
  }

  return (
    <>
      <div className="change-conv-name-text">{text}</div>
      <div className={`change-conv-name ${isFocused || value ? "focused" : ""}`}>
        <div className="change-conv-name-inner">
          <div className="input-container">
            <label className={`input-label ${isFocused || value ? "focused" : ""}`}>
              Nom de la conversation
            </label>
            {nbCharS > 0 && (
              <div className="conv-name-char-counter">
                {nbCharS}/{maxLength}
              </div>
            )}
            <input
              type="text"
              className="text-input"
              ref={inputTextRef}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              maxLength={maxLength}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
      <div className="change-conv-name-buttons">
        <div className="change-conv-name-error">{errorMsg}</div>
        <button className="cancel-btn change-conv-name-btn" onClick={closeModal}>
          Annuler
        </button>
        <button className="confirm-btn change-conv-name-btn" onClick={() => changeConvName(value)}>
          Enregistrer
        </button>
      </div>
    </>
  );
}

export default ChangeConvName;
