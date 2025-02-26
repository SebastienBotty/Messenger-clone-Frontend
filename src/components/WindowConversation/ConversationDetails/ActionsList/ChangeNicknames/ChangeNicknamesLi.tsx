import React, { useRef, useState, useEffect } from "react";
import "./ChangeNicknames.css";
import { ConversationMemberType } from "../../../../../typescript/types";
import ProfilePic from "../../../../Utiles/ProfilePic/ProfilePic";
import { CheckmarkOutline, PencilOutline } from "react-ionicons";
import { patchConvNickname } from "../../../../../api/conversation";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import { useMessagesContext, useUserContext } from "../../../../../constants/context";
const ChangeNicknamesLi = ({
  member,
  closeModal,
}: {
  member: ConversationMemberType;
  closeModal: () => void;
}) => {
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { user } = useUserContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { setMessages } = useMessagesContext();
  const [editingUserId, setEditingUserId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState<string>(member.nickname);

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      changeNickName();
    }
  };

  const changeNickName = async () => {
    if (!displayedConv?._id || !user) return;
    const res = await patchConvNickname(displayedConv._id, user._id, member.userId, inputValue);
    if (res) {
      setEditingUserId("");
      console.log(res);
      setDisplayedConv(res.conversation);
      setMostRecentConv(res.conversation);
      setMessages((prev) => {
        return [...prev, res.conversation.lastMessage];
      });
      closeModal();
    }
  };
  const editNickname = (userId: string) => {
    if (editingUserId === userId) return;
    console.log(userId);
    setEditingUserId(userId);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingUserId &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setEditingUserId("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingUserId]);

  if (!displayedConv) return <></>;
  return (
    <li key={member._id}>
      <div
        ref={containerRef}
        className="nickname-container"
        onClick={() => editNickname(member.userId)}
      >
        <div className="nick-name-container-photo-container">
          <div className="nick-name-container-photo-container-profile-pic">
            <ProfilePic props={member.photo || ""} />
          </div>
        </div>

        <div className="nickname-username-container">
          {editingUserId === member.userId ? (
            <input
              ref={inputRef}
              type="text"
              className="nickname-input"
              maxLength={20}
              placeholder={member.nickname || member.username}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <>
              <div className="nickname-username">{member.nickname || member.username}</div>
              <div className="nickname-nickname">
                {member.nickname ? member.username : "Choisir un pseudo"}
              </div>
            </>
          )}
        </div>
        <div className="nickname-icon-container">
          {editingUserId === member.userId ? (
            <CheckmarkOutline color={"#00000"} onClick={changeNickName} />
          ) : (
            <PencilOutline color={"#00000"} />
          )}
        </div>
      </div>
    </li>
  );
};

export default ChangeNicknamesLi;
