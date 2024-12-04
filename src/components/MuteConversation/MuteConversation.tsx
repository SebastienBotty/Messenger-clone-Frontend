import React, { useState } from "react";
import { muteConv } from "../../constants/ConfirmationMessage";
import { useUserContext } from "../../constants/context";
import "./MuteConversation.css";
import { ApiToken } from "../../localStorage";

function MuteConversation({
  closeModal,
  conversationId,
}: {
  closeModal: () => void;
  conversationId: string;
}) {
  const { user, setUser } = useUserContext();
  const [checkBoxChecked, setCheckBoxChecked] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  //Amount of mute time for each value
  const muteTimeOptions: { [key: number]: number } = {
    1: 1000 * 60 * 15, //15min
    2: 1000 * 60 * 60, //1h
    3: 1000 * 60 * 60 * 8, //8h
    4: 1000 * 60 * 60 * 24, //1j
    5: 1000 * 60 * 60 * 24 * 100000, // a big number: until user reactivates the conversation
  };
  const submitMute = () => {
    if (checkBoxChecked === 0) {
      setErrorMsg("Veuillez choisir une option");
      return;
    }
    if (!user) {
      setErrorMsg("Une erreur est survenue, rafraichissez la page.");
      return;
    }
    muteConversation();
  };
  const muteConversation = async () => {
    if (!user) return;
    const untilDate = new Date(Date.now() + muteTimeOptions[checkBoxChecked]);
    try {
      const response = await fetch(RESTAPIUri + "/user/userId/" + user._id + "/muteConversation", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify({
          conversationId: conversationId,
          untilDate: untilDate,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const jsonData = await response.json();
      console.log(jsonData);

      setUser((prev) => {
        if (prev) {
          return {
            ...prev,
            mutedConversations: [...prev.mutedConversations, { conversationId, untilDate }],
          };
        }
        return prev;
      });

      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };
  return (
    <div className="mute-conversation">
      <label>
        {" "}
        <input
          type="checkbox"
          name="mute-checkbox-1"
          onChange={() => setCheckBoxChecked(1)}
          checked={checkBoxChecked === 1}
        />{" "}
        <span> {muteConv.option1}</span>
      </label>
      <label>
        {" "}
        <input
          type="checkbox"
          name="mute-checkbox-2"
          onChange={() => setCheckBoxChecked(2)}
          checked={checkBoxChecked === 2}
        />{" "}
        <span> {muteConv.option2}</span>
      </label>
      <label>
        {" "}
        <input
          type="checkbox"
          name="mute-checkbox-3"
          onChange={() => setCheckBoxChecked(3)}
          checked={checkBoxChecked === 3}
        />{" "}
        <span> {muteConv.option3}</span>
      </label>
      <label>
        {" "}
        <input
          type="checkbox"
          name="mute-checkbox-4"
          onChange={() => setCheckBoxChecked(4)}
          checked={checkBoxChecked === 4}
        />{" "}
        <span> {muteConv.option4}</span>
      </label>
      <label>
        {" "}
        <input
          type="checkbox"
          name="mute-checkbox-5"
          onChange={() => setCheckBoxChecked(5)}
          checked={checkBoxChecked === 5}
        />{" "}
        <span> {muteConv.option5}</span>
      </label>

      <span className="mute-conversation-text">{muteConv.text}</span>
      <span className="mute-conversation-error-msg">{errorMsg}</span>
      <div className="mute-conversation-btns-container">
        {" "}
        <button className="cancel-button confirmation-modal-btn" onClick={closeModal}>
          Annuler
        </button>
        <button className="confirm-button confirmation-modal-btn" onClick={submitMute}>
          Confirmer
        </button>
      </div>
    </div>
  );
}

export default MuteConversation;
