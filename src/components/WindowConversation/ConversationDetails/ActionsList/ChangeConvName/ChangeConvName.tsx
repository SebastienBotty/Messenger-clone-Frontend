import React, { useEffect, useState, useContext } from "react";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import { useMessagesContext } from "../../../../../constants/context";
import { UserContext } from "../../../../../screens/userLoggedIn/userLoggedIn";
import "./ChangeConvName.css";
import { ApiToken } from "../../../../../localStorage";
function ChangeConvName({
  closeModal,
  text,
}: {
  closeModal: () => void;
  text: string;
}) {
  const user = useContext(UserContext);
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { setMessages } = useMessagesContext();
  const [nbCharS, setNbCharS] = useState<number>(0);
  const [value, setValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const RESTApiUri = process.env.REACT_APP_REST_API_URI;
  console.log(RESTApiUri);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setNbCharS(e.target.value.length);
  };

  const changeConvName = async (value: string) => {
    if (!displayedConv || !user) {
      setErrorMsg(
        "Une erreur est survenue, rafraichissement de la page dans 5 sec"
      );
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      return;
    }
    if (!value || value === "") {
      setErrorMsg("Veuillez entrer un nom de conversation valide");
      return;
    }

    if (value.length > 20) {
      setErrorMsg("Le nom de conversation doit avoir moins de 50 caractères");
      return;
    }
    if (value === displayedConv?.customization.conversationName) {
      setErrorMsg("La conversation porte déja ce nom");
      return;
    }
    try {
      const response = await fetch(
        RESTApiUri + "/conversation/changeConversationName",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + ApiToken(),
          },
          body: JSON.stringify({
            conversationId: displayedConv._id,
            conversationName: value,
            userId: user._id,
            date: new Date(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const jsonData = await response.json();
      console.log(jsonData);
      setDisplayedConv(jsonData.conversation);
      setMostRecentConv(jsonData.conversation);
      setMessages((prev) => {
        return [...prev, jsonData.conversation.lastMessage];
      });
      closeModal();
    } catch (error) {}
  };

  useEffect(() => {
    if (displayedConv?.customization.conversationName) {
      setNbCharS(displayedConv.customization.conversationName.length);
      setValue(displayedConv.customization.conversationName);
      setIsFocused(true);
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
      <div
        className={`change-conv-name ${isFocused || value ? "focused" : ""}`}
      >
        <div className="change-conv-name-inner">
          <div className="input-container">
            <label
              className={`input-label ${isFocused || value ? "focused" : ""}`}
            >
              Nom de la conversation
            </label>
            {isFocused && (
              <div className="conv-name-char-counter">{nbCharS}/50</div>
            )}
            <input
              type="text"
              className="text-input"
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={50}
            />
          </div>
        </div>
      </div>
      <div className="change-conv-name-buttons">
        <div className="change-conv-name-error">{errorMsg}</div>
        <button
          className="cancel-btn change-conv-name-btn"
          onClick={closeModal}
        >
          Annuler
        </button>
        <button
          className="confirm-btn change-conv-name-btn"
          onClick={() => changeConvName(value)}
        >
          Enregistrer
        </button>
      </div>
    </>
  );
}

export default ChangeConvName;
