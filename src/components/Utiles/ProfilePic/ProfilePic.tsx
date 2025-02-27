import React, { useContext } from "react";
import "./ProfilePic.css";
import { ConversationType } from "../../../typescript/types";
import { PeopleOutline, PersonOutline } from "react-ionicons";
import { useUserContext } from "../../../constants/context";
import UserStatus from "../../UserStatus/UserStatus";

function ProfilePic({
  picSrc,
  status,
  isGroupConversationPic,
  isOnline = false,
  showStatus = true,
}: {
  picSrc: string | undefined;
  status: string | undefined;
  isGroupConversationPic: boolean;
  isOnline?: boolean;
  showStatus?: boolean;
}) {
  if (picSrc === undefined) {
    return <></>;
  }

  if (isGroupConversationPic) {
    if (picSrc.length > 0) {
      return (
        <div className="profile-pic">
          <img src={picSrc} />
        </div>
      );
    } else {
      return (
        <div className="profile-pic">
          <PeopleOutline height={"75%"} width={"75%"} />
        </div>
      );
    }
  } else {
    if (picSrc.length > 0 && status) {
      return (
        <div className="profile-pic">
          <img src={picSrc} />
          {showStatus && isOnline && (
            <div className="profile-pic-user-status">
              <UserStatus status={status} />
            </div>
          )}
        </div>
      );
    } else if (status) {
      return (
        <div className="profile-pic">
          <PersonOutline height={"75%"} width={"75%"} />{" "}
          {showStatus && isOnline && (
            <div className="profile-pic-user-status">
              <UserStatus status={status} />
            </div>
          )}
        </div>
      );
    }
    //User only to display current user profile pic
    return <></>;
  }
}

export default ProfilePic;
