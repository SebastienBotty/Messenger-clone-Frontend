import React, { useRef, useState, useEffect } from "react";
import "./ChangeNicknames.css";
import { ConversationMemberType } from "../../../../../typescript/types";
import ProfilePic from "../../../../Utiles/ProfilePic/ProfilePic";
import { CheckmarkOutline, PencilOutline } from "react-ionicons";

const ChangeNicknamesLi = ({ member }: { member: ConversationMemberType }) => {
  const [editingUserId, setEditingUserId] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState<string>("");

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

  const editNickname = (userId: string) => {
    console.log(userId);
    setEditingUserId(userId);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
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
              value={member.nickname || inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
            <CheckmarkOutline color={"#00000"} />
          ) : (
            <PencilOutline color={"#00000"} />
          )}
        </div>
      </div>
    </li>
  );
};

export default ChangeNicknamesLi;
