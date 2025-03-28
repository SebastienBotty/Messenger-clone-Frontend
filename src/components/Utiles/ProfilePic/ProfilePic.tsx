import React, { useContext } from "react";
import "./ProfilePic.css";
import { PeopleOutline, PersonOutline } from "react-ionicons";
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
          <img src={picSrc} loading="lazy" />
        </div>
      );
    } else {
      return (
        <div className="profile-pic">
          <PeopleOutline height={"100%"} width={"100%"} />
        </div>
      );
    }
  } else {
    if (picSrc.length > 0 && status) {
      return (
        <div className="profile-pic">
          <img src={picSrc} loading="lazy" />
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
          <PersonOutline height={"100%"} width={"100%"} />{" "}
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
