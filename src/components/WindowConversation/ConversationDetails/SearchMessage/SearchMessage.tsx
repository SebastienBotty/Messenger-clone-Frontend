import React, { useState, useRef, useEffect, useContext } from "react";
import "./SearchMessage.css";
import { Search, ArrowBackOutline } from "react-ionicons";
import { MessageType } from "../../../../typescript/types";
import { useDisplayedConvContext } from "../../../../screens/userLoggedIn/userLoggedIn";

import FoundMsgLi from "./FoundMsgLi/FoundMsgLi";
import {
  useMessagesContext,
  useSelectedFoundMsgIdContext,
  useUserContext,
} from "../../../../constants/context";
import { searchMsgInConversation } from "../../../../api/message";

function SearchMessage() {
  const [searchMsgInput, setSearchMsgInput] = useState("");
  const [infoMsg, setInfoMsg] = useState<string>("Appuyez sur Entrée pour rechercher");
  const [messagesList, setMessagesList] = useState<{ message: MessageType; memberPhoto: string }[]>(
    []
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const { messages } = useMessagesContext();
  const { setSelectedFoundMsgId } = useSelectedFoundMsgIdContext();

  const getMsgContainingWord = async () => {
    if (!user || !displayedConv) return [];
    console.log("recherche");

    /*  const searchMsgInMessages = messages.find((msg) =>                   // Removed it because if user searches a word that has been said in a recent msg, it wont search toe the other msg ocntaining it
      msg.text[msg.text.length - 1].includes(searchMsgInput)
    );
    if (searchMsgInMessages) {
      console.log("msg trouvé dans les messages");
      return [searchMsgInMessages];
    } */
    const fetchMsgInConv = await searchMsgInConversation(
      user._id,
      displayedConv._id,
      searchMsgInput
    );
    if (fetchMsgInConv) {
      if (fetchMsgInConv.length > 0) {
        console.log("msg trouvé dans la conversation");
        return fetchMsgInConv;
      }
      return fetchMsgInConv;
    }
    return [];
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
          {messagesList
            .sort((a, b) => new Date(b.message.date).getTime() - new Date(a.message.date).getTime())
            .map((message) => (
              <div className="messageList-container">
                <FoundMsgLi
                  msg={message.message}
                  key={message.message._id}
                  word={searchMsgInput}
                  memberPhoto={message.memberPhoto}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchMessage;
