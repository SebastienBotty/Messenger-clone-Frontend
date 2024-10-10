import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import "./Modal.css";
import { SearchOutline, Close } from "react-ionicons";
import {
  UserContext,
  useRecentConversationContext,
} from "../../screens/userLoggedIn/userLoggedIn";
import _ from "lodash";
import { ApiToken } from "../../localStorage";
import { ConversationType } from "../../typescript/types";
import ConversationLi from "./ConversationLi";

function Modal({
  closeModal,
  selectedImg,
}: {
  closeModal: () => void;
  selectedImg: string | undefined;
}) {
  const user = useContext(UserContext);

  const [searchConversationInput, setSearchConversationInput] =
    useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [conversationsList, setConversationsList] = useState<
    ConversationType[]
  >([]);
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const { recentConversations } = useRecentConversationContext();

  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Si le clic est sur l'overlay (et non sur le contenu du modal), fermer le modal
    if ((e.target as HTMLDivElement).classList.contains("modal-overlay")) {
      closeModal();
    }
  };

  const handleSearchInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchConversationInput(e.target.value);
    if (e.target.value.length > 2) {
      debouncedFetConversations(e.target.value);
    }
  };

  const searchConversationWithUser = async (searchQuery: string) => {
    try {
      if (!user) {
        throw new Error("L'utilisateur n'est pas défini.");
      }
      const response = await fetch(
        RESTAPIUri +
          "/conversation/userId/" +
          user?._id +
          "/conversationsWith?members=" +
          searchQuery +
          "&user=" +
          user?.userName,
        {
          headers: { authorization: `Bearer ${ApiToken()}` },
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'utilisateur");
      }
      const jsonData = await response.json();
      console.log("SEARCH VONERSATION ICI");
      console.log(jsonData);
      //setUsersPrediction(jsonData);
      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return false;
    }
  };

  const debouncedFetConversations = useCallback(
    _.debounce(async (searchQuery: string) => {
      console.log("))))))))");
      console.log(searchQuery);

      let conversations = await searchConversationWithUser(searchQuery);
      console.log(conversations);
      setConversationsList(conversations.sort(sortConversationList));
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
      console.log("RECENT CONVERSATIONS");
      console.log(recentConversations);
      setConversationsList(recentConversations);
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    return () => {};
  }, [searchConversationInput]);

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
                <label
                  htmlFor="search-conversations"
                  className="modal-search-conversations-label"
                >
                  <div className="modal-search-icon-container">
                    {" "}
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
                {JSON.stringify(recentConversations) ===
                JSON.stringify(conversationsList) ? (
                  <>
                    <h3 style={{ marginLeft: "2.5rem" }}>Récent</h3>
                  </>
                ) : (
                  <>
                    <h3 style={{ marginLeft: "2.5rem" }}>Conversations</h3>
                  </>
                )}
                {conversationsList.length > 0 &&
                  conversationsList.map((conversation: ConversationType) => (
                    <ConversationLi
                      key={conversation._id}
                      conversation={conversation}
                      user={user}
                      selectedImg={selectedImg}
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

export default Modal;
