import React, { useContext } from "react";
import "./ProfilePic.css";
import { ConversationType } from "../../../typescript/types";
import { PeopleOutline, PersonOutline } from "react-ionicons";
import { useUserContext } from "../../../constants/context";
import UserStatus from "../../UserStatus/UserStatus";

function ProfilePic({
  props,
}: {
  props: ConversationType | string | undefined;
}) {
  const { user } = useUserContext();
  if (props === undefined || !user) {
    return <>RIEN</>;
  }

  //User only to display current user profile pic
  if (typeof props === "string") {
    if (props.length > 0) {
      return (
        <div className="profile-pic">
          <img src={props} />
          <div className="profile-pic-user-status">
            <UserStatus status={user.status} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="profile-pic">
          <PersonOutline height={"75%"} width={"75%"} />{" "}
          <div className="profile-pic-user-status">
            <UserStatus status={user.status} />
          </div>
        </div>
      );
    }

    //used to display conversations pic
  } else {
    //Group conversation
    if (props.isGroupConversation) {
      if (props.customization.photo?.length > 0) {
        return (
          <div className="profile-pic">
            <img src={props.customization.photo} />
          </div>
        );
      } else {
        return (
          <div className="profile-pic">
            <PeopleOutline height={"75%"} width={"75%"} />
          </div>
        );
      }

      //Private conversation
    } else {
      const status = props.partnerInfos?.isOnline
        ? props.partnerInfos.status
        : "Offline";

      if (props.partnerInfos?.photo?.length) {
        return (
          <div className="profile-pic">
            <img src={props.partnerInfos?.photo} />
            <div className="profile-pic-user-status">
              <UserStatus status={status} />
            </div>
          </div>
        );
      } else if (props.partnerInfos?.photo === "") {
        return (
          <div className="profile-pic">
            <PersonOutline height={"75%"} width={"75%"} />
            <div className="profile-pic-user-status">
              <UserStatus status={status} />
            </div>
          </div>
        );
      }
      console.log("rrrr");
      return <></>;
    }
  }
}

export default ProfilePic;
