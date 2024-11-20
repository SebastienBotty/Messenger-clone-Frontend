import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
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
import { socket } from "../../../../../socket";
import {
  useMessagesContext,
  useUserContext,
} from "../../../../../constants/context";
import ProfilePic from "../../../../Utiles/ProfilePic/ProfilePic";

function AddMembersModal({
  showAddMembersModal,
  setShowAddMembersModal,
}: {
  showAddMembersModal: boolean;
  setShowAddMembersModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user, setUser } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { messages, setMessages } = useMessagesContext();
  const { setMostRecentConv } = useMostRecentConvContext();

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

  const handleAddMembers = async (
    arrMembers: UserDataType[],
    conversationId: string | undefined,
    userUsername: string | undefined,
    userId: string | undefined
  ) => {
    console.log(arrMembers, conversationId, userUsername, userId);
    if (!conversationId || !userUsername || !userId || arrMembers.length < 1)
      return;
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
      setDisplayedConv(updatedConv);
      setMostRecentConv(updatedConv);
      setShowAddMembersModal(false);
      setMessages((prev) => [...prev, jsonData.message]);
      //emitToSockets("convUpdate", updatedConv);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const getUsersSocket = async (
    conversation: ConversationType | null
  ): Promise<{ userName: string; socketId: string }[] | false> => {
    if (!conversation || !user) return false;

    const convMembersStr = conversation.members
      ?.filter((member) => member !== user.userName)
      .join("-");
    try {
      const response = await fetch(
        RESTAPIUri + "/user/getSockets?convMembers=" + convMembersStr,
        {
          headers: {
            Authorization: "Bearer " + ApiToken(),
          },
        }
      );
      const jsonData = await response.json();
      //console.log("ICI SOCKET");
      //console.log(jsonData);

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

  const emitToSockets = async (eventName: string, data: any): Promise<void> => {
    if (!displayedConv || !user) return;

    const convMembersSocket = await getUsersSocket(displayedConv);
    if (!convMembersSocket) return;
    socket.emit(eventName, [convMembersSocket, data]);
  };
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    return () => {};
  }, []);

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
                    <div
                      className="added-member-img-container"
                      onClick={() => console.log(user)}
                    >
                      <ProfilePic props={user.photo} />
                    </div>
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
                      <div className="found-msg-user-img-container">
                        {" "}
                        <ProfilePic props={user.photo} />
                      </div>
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
              <div className="confirm-btn-container">
                {" "}
                <button
                  className="confirm-add-members-btn"
                  disabled={addedMembers.length === 0}
                  onClick={() => {
                    handleAddMembers(
                      addedMembers,
                      displayedConv?._id,
                      user?.userName,
                      user?._id
                    );
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
