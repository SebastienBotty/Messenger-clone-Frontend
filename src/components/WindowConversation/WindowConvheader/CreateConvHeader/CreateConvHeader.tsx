import React, { useCallback, useEffect, useRef, useState } from "react";
import "./CreateConvHeader.css";
import { Close } from "react-ionicons";
import { UserDataType } from "../../../../typescript/types";
import { useMessagesContext, useUserContext } from "../../../../constants/context";
import ProfilePic from "../../../Utiles/ProfilePic/ProfilePic";
import _ from "lodash";
import { fetchSearchUser } from "../../../../api/user";
function CreateConvHeader({
  addedMembers,
  setAddedMembers,
  setShowConvDetails,
}: {
  addedMembers: string[];
  setAddedMembers: React.Dispatch<React.SetStateAction<string[]>>;
  setShowConvDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useUserContext();
  const { setMessages } = useMessagesContext();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchUserInput, setSearchUserInput] = useState<string>("");
  const [usersPrediction, setUsersPrediction] = useState<UserDataType[]>([]);

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

  const searchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUserInput(e.target.value);
    debouncedFetchUsers(e.target.value);
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
          setUsersPrediction(users);
        }
      } else {
        return false;
      }
    }, 300),
    []
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
          value={searchUserInput}
        />
        <div className="dropdown-search-list" id={searchUserInput.length > 2 ? "visible" : ""}>
          {usersPrediction.length > 0 ? (
            usersPrediction.map((userPrediction) => {
              if (
                !addedMembers.includes(userPrediction.userName) &&
                userPrediction.userName !== user?.userName
              ) {
                return (
                  <li key={userPrediction._id} onClick={() => handleSearch(userPrediction)}>
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
