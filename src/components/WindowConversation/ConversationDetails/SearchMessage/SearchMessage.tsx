import React, { useState, useRef, useEffect, useContext } from "react";
import "./SearchMessage.css";
import { Search, ArrowBackOutline } from "react-ionicons";
import { MessageType } from "../../../../typescript/types";
import { useDisplayedConvContext } from "../../../../screens/userLoggedIn/userLoggedIn";

import { ApiToken } from "../../../../localStorage";
import FoundMsgLi from "./FoundMsgLi/FoundMsgLi";
import {
  useSelectedFoundMsgIdContext,
  useUserContext,
} from "../../../../constants/context";

function SearchMessage() {
  const [searchMsgInput, setSearchMsgInput] = useState("");
  const [infoMsg, setInfoMsg] = useState<string>(
    "Appuyez sur Entrée pour rechercher"
  );
  const [messagesList, setMessagesList] = useState<MessageType[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const { setSelectedFoundMsgId } = useSelectedFoundMsgIdContext();
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const getMsgContainingWord = async () => {
    console.log("recherche");
    try {
      const response = await fetch(
        RESTAPIUri +
          "/message/userId/" +
          user?._id +
          "/searchMessages?conversation=" +
          displayedConv?._id +
          "&word=" +
          searchMsgInput,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${ApiToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lor du fetch");
      }

      const jsonData = await response.json();
      return jsonData;
    } catch (error) {}
  };

  const handleSearchMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchMsgInput(e.target.value);
    setMessagesList([]);
    if (!infoMsg) {
      setInfoMsg("Appuyez sur Entrée pour rechercher");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchMsgInput.trim().length > 1) {
      setInfoMsg("");
      const messages = await getMsgContainingWord();
      if (messages.length > 0) {
        setMessagesList(messages);
      } else {
        setInfoMsg("Aucun message ne correspond à votre recherche");
      }
    } else {
      setInfoMsg("Entrez un mot d'au moins deux caractères");
    }
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    return () => {
      setSelectedFoundMsgId("");
    };
  }, []);

  return (
    <div className="search-message-container">
      <div className="searchbar-message">
        <form onSubmit={(e) => handleSubmit(e)}>
          <label htmlFor="search-message" className="searchbar-message-label">
            <div className="search-icon-container">
              {" "}
              <Search color={"#65676b"} />
            </div>
          </label>
          <input
            className="message-searchbar-input"
            id="search-message"
            name="search-message"
            type="text"
            placeholder="Rechercher un mot"
            ref={searchInputRef}
            value={searchMsgInput}
            onChange={(e) => {
              handleSearchMsg(e);
            }}
          />
        </form>
      </div>
      {infoMsg && <p className="info-msg">{infoMsg}</p>}
      {messagesList && (
        <div className="search-message-list">
          {messagesList.map((message) => (
            <div className="messageList-container">
              <FoundMsgLi
                msg={message}
                key={message._id}
                word={searchMsgInput}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchMessage;
