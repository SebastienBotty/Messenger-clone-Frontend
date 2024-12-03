import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import "./AddMembersModal.css";
import "../../../../Modal/Modal.css";
import { ConversationType, UserDataType } from "../../../../../typescript/types";
import { AddCircleOutline, CheckmarkCircleOutline, Close, SearchOutline } from "react-ionicons";
import { ApiToken } from "../../../../../localStorage";
import _ from "lodash";
import { useMessagesContext, useUserContext } from "../../../../../constants/context";
import ProfilePic from "../../../../Utiles/ProfilePic/ProfilePic";

function AddMembersModal({
  conversation,
  closeModal,
}: {
  conversation: ConversationType;
  closeModal: () => void;
}) {
  const { user } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const ref = useRef<HTMLDivElement>(null);
  const { setMessages } = useMessagesContext();
  const { setMostRecentConv } = useMostRecentConvContext();

  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const [searchConversationInput, setSearchConversationInput] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [usersPrediction, setUsersPrediction] = useState<UserDataType[]>([]);
  const [addedMembers, setAddedMembers] = useState<UserDataType[]>([]);

  const handleSearchInputValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchConversationInput(e.target.value);
    debouncedFetchUsers(e.target.value);
  };

  const debouncedFetchUsers = useCallback(
    _.debounce(async (searchQuery: string) => {
      console.log("))))))))");
      console.log(searchQuery);
      const exceptUsers = conversation.members;
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

  const handleAddMembers = async (
    arrMembers: UserDataType[],
    conversationId: string | undefined,
    userUsername: string | undefined,
    userId: string | undefined
  ) => {
    console.log(arrMembers, conversationId, userUsername, userId);
    if (!conversationId || !userUsername || !userId || arrMembers.length < 1) return;
    try {
      const response = await fetch(RESTAPIUri + "/conversation/addMembers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify({
          addedUsers: arrMembers,
          conversationId: conversationId,
          adderUsername: userUsername,
          adderUserId: userId,
          date: new Date(),
        }),
      });

      if (!response.ok) {
        const jsonData = await response.json();
        throw new Error(jsonData.message);
      }
      const jsonData = await response.json();

      console.log(jsonData);
      const updatedConv = jsonData.conversation;
      updatedConv.lastMessage = jsonData.message;
      setAddedMembers([]);
      if (conversation._id === displayedConv?._id) {
        setDisplayedConv(updatedConv);
      }
      setMostRecentConv(updatedConv);
      closeModal();
      setMessages((prev) => [...prev, jsonData.message]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    //document.addEventListener("mousedown", handleClickOutside);

    return () => {
      //document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="modal">
      <div className="modal-overlay">
        <div className="modal-content" ref={ref}>
          <div className="modal-content-inner">
            <div className="modal-title">
              <div className="modal-title-text">
                {" "}
                <h2>Ajouter des membres</h2>
              </div>
              <div className="modal-close-button">
                <Close
                  onClick={() => closeModal()}
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
                  <div className="no-added-members">Aucun utilisateur sélectionné</div>
                )}
                {addedMembers.map((user) => (
                  <div className="modal-added-member">
                    <div className="added-member-img-container" onClick={() => console.log(user)}>
                      <ProfilePic props={user.photo} />
                    </div>
                    <div className="added-member-username">{user.userName}</div>
                  </div>
                ))}
              </div>
              <div className="users-found-list">
                {usersPrediction.map((user) => (
                  <div className="user-found" onClick={() => handleUserClick(user)}>
                    <div className="found-msg-user-img">
                      <div className="found-msg-user-img-container">
                        {" "}
                        <ProfilePic props={user.photo} />
                      </div>
                    </div>
                    <div className="found-username-txt"> {user.userName}</div>
                    <div className="is-user-added">
                      {isUserAdded(user._id) ? (
                        <>
                          <CheckmarkCircleOutline color={"blue"} width={"2rem"} height={"2rem"} />
                        </>
                      ) : (
                        <>
                          <AddCircleOutline color={"#65676b"} width={"2rem"} height={"2rem"} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="confirm-btn-container">
                {" "}
                <button
                  className="confirm-add-members-btn"
                  disabled={addedMembers.length === 0}
                  onClick={() => {
                    handleAddMembers(addedMembers, conversation._id, user?.userName, user?._id);
                  }}
                >
                  Ajouter des personnes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMembersModal;
