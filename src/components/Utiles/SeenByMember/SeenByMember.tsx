import { useEffect } from "react";
import "./SeenByMember.css";
import { ConversationType } from "../../../typescript/types";
import ProfilePic from "../ProfilePic/ProfilePic";
import { compareNowToDate, formatDateMsg } from "../../../functions/time";
import { getNickNameById } from "../../../functions/StrFormatter";
const SeenByMember = ({
  conversation,
  userId,
  seenByDate,
  width,
  showSeenByTooltip = false,
  showUsernameTooltip = false,
}: {
  conversation: ConversationType;
  userId: string;
  seenByDate: Date;
  width?: string;
  showSeenByTooltip?: boolean;
  showUsernameTooltip?: boolean;
}) => {
  const photo = conversation.members.find((member) => member.userId === userId)?.photo;
  return (
    <div className="seen-by-member" style={{ width: width }}>
      <ProfilePic
        picSrc={photo}
        status={"Offline"}
        isGroupConversationPic={false}
        showStatus={false}
      />
      {showSeenByTooltip && (
        <div className="seen-by-member-tooltip right-tooltip">
          Vu par {getNickNameById(conversation.members, userId)}{" "}
          {formatDateMsg(seenByDate) || "à l'instant"}
        </div>
      )}
      {showUsernameTooltip && (
        <div className="seen-by-member-tooltip left-tooltip">
          {getNickNameById(conversation.members, userId)}
        </div>
      )}
    </div>
  );
};

export default SeenByMember;
