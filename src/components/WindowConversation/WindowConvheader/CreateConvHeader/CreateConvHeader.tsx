import React, { useCallback, useEffect, useRef, useState } from "react";
import "./CreateConvHeader.css";
import { Close } from "react-ionicons";
import { UserDataType } from "../../../../typescript/types";
import {
  useAddedMembersContext,
  useMessagesContext,
  useUserContext,
} from "../../../../constants/context";
import ProfilePic from "../../../Utiles/ProfilePic/ProfilePic";
import _ from "lodash";
import { fetchSearchUser } from "../../../../api/user";
function CreateConvHeader({
  setShowConvDetails,
}: {
  setShowConvDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useUserContext();
  const { setMessages } = useMessagesContext();
  const { addedMembers, setAddedMembers } = useAddedMembersContext();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchUserInput, setSearchUserInput] = useState<string>("");
  const [usersPrediction, setUsersPrediction] = useState<UserDataType[]>([]);
  const [preSelectedUser, setPreSelectedUser] = useState<number>(0);

  const handleSearch = (user: UserDataType) => {
    if (addedMembers.includes(user.userName)) {
      //console.log("User déja ajouté");
      setSearchUserInput("");
    } else {
      addMember(user.userName);
      setUsersPrediction([]);
    }

    setSearchUserInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowUp":
        setPreSelectedUser(
          (prevIndex) => (prevIndex - 1 + usersPrediction.length) % usersPrediction.length
        );
        break;
      case "ArrowDown":
        setPreSelectedUser((prevIndex) => (prevIndex + 1) % usersPrediction.length);
        break;
      case "Enter":
        setPreSelectedUser((prevIndex) => {
          addMember(usersPrediction[prevIndex].userName);
          setUsersPrediction([]);
          setSearchUserInput("");
          return 0;
        });
        break;
      default:
        break;
    }
  };

  const searchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUserInput(e.target.value);
    debouncedFetchUsers(e.target.value);
    setPreSelectedUser(0);
  };

  const addMember = (username: string) => {
    setAddedMembers((prev) => [...prev, username]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  const debouncedFetchUsers = useCallback(
    _.debounce(async (searchQuery: string) => {
      //console.log("))))))))");
      //console.log(searchQuery);
      if (searchQuery.length > 2) {
        const users = await fetchSearchUser(searchQuery);
        if (users) {
          const filteredUsers = users.filter((user) => !addedMembers.includes(user.userName));
          setUsersPrediction(filteredUsers);
        }
      } else {
        return false;
      }
    }, 300),
    [addedMembers]
  );

  useEffect(() => {
    if (searchInputRef.current) {
      setMessages([]);
      searchInputRef.current.focus();
      setAddedMembers([]);
      setShowConvDetails(false);
    }
  }, []);
  return (
    <div className="create-conversation-add-members">
      <label htmlFor="add-members-input">A : </label>
      <div className="added-members-container">
        {addedMembers.map((addedMember) => {
          return (
            <div className="member" key={addedMember}>
              <span>{addedMember} </span>
              <div
                id="create-conversation-delete-member"
                onClick={() =>
                  setAddedMembers((prev) => prev.filter((item) => item !== addedMember))
                }
              >
                <Close color={"#0084ff"} title={"Supprimer"} height="1.25rem" width="1.25rem" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="search-user">
        <input
          ref={searchInputRef}
          type="text"
          id="add-members-input"
          name="add-members-input"
          onChange={(e) => searchUser(e)}
          onKeyDown={handleKeyDown}
          value={searchUserInput}
        />
        <div className="dropdown-search-list" id={searchUserInput.length > 2 ? "visible" : ""}>
          {usersPrediction.length > 0 ? (
            usersPrediction.map((userPrediction, index) => {
              if (
                !addedMembers.includes(userPrediction.userName) &&
                userPrediction.userName !== user?.userName
              ) {
                return (
                  <li
                    key={userPrediction._id}
                    onClick={() => handleSearch(userPrediction)}
                    style={index === preSelectedUser ? { backgroundColor: "#97b9db" } : {}}
                  >
                    <div className="user-profile-pic">
                      <ProfilePic
                        picSrc={userPrediction.photo}
                        status={userPrediction.status}
                        isOnline={userPrediction.isOnline}
                        isGroupConversationPic={false}
                      />
                    </div>
                    <span> {userPrediction.userName}</span>
                  </li>
                );
              }
            })
          ) : (
            <li>
              <div className="no-user-found">
                <span>Aucun utilisateur trouvé</span>
              </div>
            </li>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateConvHeader;
