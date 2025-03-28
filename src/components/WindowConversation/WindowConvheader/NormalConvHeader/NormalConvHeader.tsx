import React from "react";
import ProfilePic from "../../../Utiles/ProfilePic/ProfilePic";
import { useUserContext } from "../../../../constants/context";
import { useDisplayedConvContext } from "../../../../screens/userLoggedIn/userLoggedIn";
import { formatListWithLimit, getNickNameByUsername } from "../../../../functions/StrFormatter";
import { Videocam } from "react-ionicons";
import { InformationCircle } from "react-ionicons";
import { Call } from "react-ionicons";
import { timeSince } from "../../../../functions/time";
import "./NormalConvHeader.css";
import { statusTranslate } from "../../../../constants/status";
function NormalConvHeader({
  setShowConvDetails,
}: {
  setShowConvDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { displayedConv } = useDisplayedConvContext();
  const { user } = useUserContext();

  const isPrivateConv = !displayedConv?.isGroupConversation;
  let partner;
  if (isPrivateConv) {
    partner = displayedConv?.members.find((member) => member.userId !== user?._id);
  }

  const renderOnlineSince = () => {
    if (!displayedConv || !user || displayedConv.isGroupConversation) return null;
    const partnerInfos = displayedConv.members.find((member) => member.userId !== user._id);
    if (!partnerInfos) return null;
    if (partnerInfos.isOnline && partnerInfos.status !== "Offline")
      return statusTranslate(partnerInfos.status);
    return "Hors ligne depuis " + timeSince(new Date(partnerInfos.lastSeen));
  };
  if (!displayedConv) return null;
  return (
    <>
      <div className="img-container">
        {isPrivateConv ? (
          <ProfilePic
            picSrc={partner?.photo}
            status={partner?.status}
            isOnline={partner?.isOnline}
            isGroupConversationPic={false}
          />
        ) : (
          <ProfilePic
            picSrc={displayedConv?.customization.photo}
            status={undefined}
            isGroupConversationPic={true}
          />
        )}{" "}
      </div>
      <div className="conversation-member-info-text-container">
        <div className="conversation-member-name">
          {displayedConv?.isGroupConversation
            ? displayedConv?.customization.conversationName
              ? displayedConv?.customization.conversationName
              : formatListWithLimit(
                  displayedConv?.members
                    .filter((item) => item.username !== user?.userName)
                    .map((member) => getNickNameByUsername(displayedConv.members, member.username)),
                  4
                )
            : displayedConv?.members
                .filter((item) => item.username !== user?.userName)
                .map((member) => getNickNameByUsername(displayedConv.members, member.username))}
        </div>
        <div
          className="online-since"
          onClick={() => {
            console.log(displayedConv);
          }}
        >
          {renderOnlineSince()}
        </div>
      </div>
      <div className="conversation-buttons">
        <Call
          color={"#00000"}
          title="Passer un appel vocal"
          height="3vh"
          width="3vh"
          onClick={() => alert("Not implemented")}
        />
        <Videocam
          color={"#00000"}
          title="Lancer un appel vidéo"
          height="3vh"
          width="3vh"
          onClick={() => alert("Not implemented")}
        />
        <InformationCircle
          color={"#00000"}
          title="Informations sur la conversation"
          height="3vh"
          width="3vh"
          onClick={() => setShowConvDetails((prev) => !prev)}
        />
      </div>
    </>
  );
}

export default NormalConvHeader;
