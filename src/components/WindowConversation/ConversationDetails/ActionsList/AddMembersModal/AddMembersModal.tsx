import React, { useState, useContext, useRef, useCallback } from "react";
import {
  useDisplayedConvContext,
  UserContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import "./AddMembersModal.css";
import "../../../../Modal/Modal.css";
import {
  ConversationType,
  UserDataType,
} from "../../../../../typescript/types";
import {
  AddCircleOutline,
  CheckmarkCircleOutline,
  Close,
  SearchOutline,
} from "react-ionicons";
import { ApiToken } from "../../../../../localStorage";
import _ from "lodash";

function AddMembersModal({
  showAddMembersModal,
  setShowAddMembersModal,
}: {
  showAddMembersModal: boolean;
  setShowAddMembersModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const user = useContext(UserContext);
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();

  const [searchConversationInput, setSearchConversationInput] =
    useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [conversationsList, setConversationsList] = useState<
    ConversationType[]
  >([]);
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const handleSearchInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchConversationInput(e.target.value);
    debouncedFetchUsers(e.target.value);
  };

  const [usersPrediction, setUsersPrediction] = useState<UserDataType[]>([]);
  const [addedMembers, setAddedMembers] = useState<UserDataType[]>([]);

  const debouncedFetchUsers = useCallback(
    _.debounce(async (searchQuery: string) => {
      console.log("))))))))");
      console.log(searchQuery);
      if (!displayedConv) return false;
      const exceptUsers = displayedConv.members;
      if (searchQuery.length > 2) {
        try {
          const response = await fetch(
            RESTAPIUri +
              "/user/username?search=" +
              searchQuery +
              "&exceptions=" +
              encodeURIComponent(JSON.stringify(exceptUsers)),
            {
              headers: { authorization: `Bearer ${ApiToken()}` },
            }
          );
          if (!response.ok) {
            const jsonData = await response.json();
            throw new Error(jsonData.message);
          }
          const jsonData = await response.json();
          console.log(jsonData);

          setUsersPrediction(jsonData);
          return jsonData;
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("An unknown error occurred");
          }
        }
      } else {
        return false;
      }
    }, 300),
    []
  );

  const handleUserClick = (user: UserDataType) => {
    const isUserAlreadyAdded = addedMembers.some((obj) => obj._id === user._id);

    if (!isUserAlreadyAdded) {
      setAddedMembers([...addedMembers, user]);
      console.log(user.userName + " a été ajouté");
    } else {
      setAddedMembers(addedMembers.filter((obj) => obj._id !== user._id));
      console.log(user.userName + " a été retiré");
    }
  };

  const isUserAdded = (userId: string) => {
    return addedMembers.some((obj) => obj._id === userId);
  };
  return (
    <div className="modal">
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-content-inner">
            <div className="modal-title">
              <div className="modal-title-text">
                {" "}
                <h2>Ajouter des membres</h2>
              </div>
              <div className="modal-close-button">
                <Close
                  onClick={() => setShowAddMembersModal(false)}
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
              <div className="modal-added-members-container">
                {addedMembers.length === 0 && (
                  <div className="no-added-members">
                    Aucun utilisateur sélectionné
                  </div>
                )}
                {addedMembers.map((user) => (
                  <div className="modal-added-member">
                    <div className="added-member-img-container">Img</div>
                    <div className="added-member-username">{user.userName}</div>
                  </div>
                ))}
              </div>
              <div className="users-found-list">
                {usersPrediction.map((user) => (
                  <div
                    className="user-found"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="found-msg-user-img">
                      <div className="found-msg-user-img-container">Img</div>
                    </div>
                    <div className="found-username-txt"> {user.userName}</div>
                    <div className="is-user-added">
                      {isUserAdded(user._id) ? (
                        <>
                          <CheckmarkCircleOutline
                            color={"blue"}
                            width={"2rem"}
                            height={"2rem"}
                          />
                        </>
                      ) : (
                        <>
                          <AddCircleOutline
                            color={"#65676b"}
                            width={"2rem"}
                            height={"2rem"}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMembersModal;
