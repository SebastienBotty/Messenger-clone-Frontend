import React, { useState, useEffect, useCallback, useRef } from "react";
import "./TransferModal.css";
import { SearchOutline, Close } from "react-ionicons";
import { useRecentConversationContext } from "../../screens/userLoggedIn/userLoggedIn";
import { useUserContext } from "../../constants/context";
import _ from "lodash";
import { ConversationType, MessageType } from "../../typescript/types";
import ConversationLi from "./ConversationLi";
import { searchConversationWithUser } from "../../api/conversation";

function TransferModal({
  closeModal,
  selectedImg,
  selectedMsg,
}: {
  closeModal: () => void;
  selectedImg: string | undefined;
  selectedMsg?: MessageType;
}) {
  const { user, setUser } = useUserContext();

  const [searchConversationInput, setSearchConversationInput] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [conversationsList, setConversationsList] = useState<ConversationType[]>([]);

  const { recentConversations } = useRecentConversationContext();

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Si le clic est sur l'overlay (et non sur le contenu du modal), fermer le modal
    if ((e.target as HTMLDivElement).classList.contains("modal-overlay")) {
      closeModal();
    }
  };

  const handleSearchInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchConversationInput(e.target.value);
    debouncedFetConversations(e.target.value);
  };

  const debouncedFetConversations = useCallback(
    _.debounce(async (searchQuery: string) => {
      if (!user?._id) return;
      console.log("))))))))");
      console.log(searchQuery);
      if (searchQuery.length > 2) {
        let conversations = await searchConversationWithUser(searchQuery, user._id, user.userName);
        if (conversations && conversations.length > 0) {
          console.log(conversations);
          setConversationsList(conversations.sort(sortConversationList));
        }
      }
    }, 300),
    []
  );

  const sortConversationList = (a: ConversationType, b: ConversationType) => {
    const aIsTwoMembers = a.members.length === 2;
    const bIsTwoMembers = b.members.length === 2;

    if (aIsTwoMembers && !bIsTwoMembers) return -1;
    if (!aIsTwoMembers && bIsTwoMembers) return 1;

    return (
      new Date(b.lastMessage.date).getTime() - // Tri par date (d'abord le plus récent)
      new Date(a.lastMessage.date).getTime()
    );
  };

  useEffect(() => {
    if (recentConversations && searchConversationInput === "") {
      setConversationsList(recentConversations);
    }
    return () => {};
  }, [searchConversationInput]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    return () => {};
  }, []);

  if (!selectedImg) {
    alert("Veuillez selectionner une image");
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
          <div className="modal-content-inner">
            <div className="modal-title">
              <div className="modal-title-text">
                {" "}
                <h2>Transférer</h2>
              </div>
              <div className="modal-close-button">
                <Close
                  onClick={closeModal}
                  color="black"
                  title={"Fermer"}
                  height="2rem"
                  width="2rem"
                />
              </div>
            </div>
            <div className="modal-search-section">
              <div className="modal-searchbar">
                <label htmlFor="search-conversations" className="modal-search-conversations-label">
                  <div className="modal-search-icon-container">
                    <SearchOutline color={"#65676b"} />
                  </div>
                </label>
                <input
                  className="modal-search-conversations"
                  id="search-conversations"
                  type="text"
                  placeholder="Rechercher dans Messenger"
                  ref={searchInputRef}
                  value={searchConversationInput}
                  onChange={handleSearchInputValue}
                />
              </div>
              <div className="conversations-list">
                {searchConversationInput.trim().length > 2 ? (
                  <>
                    <h3 style={{ marginLeft: "2.5rem" }}>Conversations</h3>
                  </>
                ) : (
                  <>
                    <h3 style={{ marginLeft: "2.5rem" }}>Récent</h3>
                  </>
                )}
                {conversationsList.length > 0 &&
                  conversationsList.map((conversation: ConversationType) => (
                    <ConversationLi
                      key={conversation._id}
                      conversation={conversation}
                      user={user}
                      selectedImg={selectedImg}
                      selectedMsg={selectedMsg}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferModal;
