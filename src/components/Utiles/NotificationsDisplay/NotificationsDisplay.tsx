import React, { useState, useEffect } from "react";
import "./NotificationsDisplay.css";
import { isConvMuted } from "../../../functions/conversation";
import {
  NotificationsOff,
  Notifications,
  NotificationsOutline,
  NotificationsOffOutline,
} from "react-ionicons";
import { formatDateMsg } from "../../../functions/time";
import { useUserContext } from "../../../constants/context";
import { ConversationType, ConfirmationModalPropsType } from "../../../typescript/types";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { muteConv } from "../../../constants/ConfirmationMessage";
import MuteConversation from "../../MuteConversation/MuteConversation";
import { unmuteConversation } from "../../../api/conversation";

function NotificationsDisplay({
  conversation,
  outlineNotifSvg,
  iconSize,
}: {
  conversation: ConversationType;
  outlineNotifSvg: boolean;
  iconSize: string;
}) {
  const { user, setUser } = useUserContext();
  const [mutedConv, setMutedConv] = useState<boolean>();
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
  });

  const svgNotifOff = outlineNotifSvg ? (
    <NotificationsOffOutline width={iconSize} height={iconSize} />
  ) : (
    <NotificationsOff width={iconSize} height={iconSize} />
  );

  const svgNotifOn = outlineNotifSvg ? (
    <NotificationsOutline width={iconSize} height={iconSize} />
  ) : (
    <Notifications width={iconSize} height={iconSize} />
  );

  const handleMuteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowConfirmationModal(true);
    setConfirmationModalProps({
      title: muteConv.title,
      text: (
        <MuteConversation
          closeModal={() => {
            setShowConfirmationModal(false);
          }}
          conversationId={conversation._id}
        />
      ),
      action: () => {},
      closeModal: () => {
        setShowConfirmationModal(false);
      },
    });
  };
  const handleUnmuteClick = async (conversation: ConversationType, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;
    const requestUnmute = await unmuteConversation(conversation._id, user._id);
    if (requestUnmute) {
      setUser((prev) => {
        if (prev)
          return {
            ...prev,
            mutedConversations: prev.mutedConversations.filter(
              (item) => item.conversationId !== conversation._id
            ),
          };
        return prev;
      });
      setMutedConv(false);
    }
  };

  useEffect(() => {
    setMutedConv(isConvMuted(user?.mutedConversations, conversation._id));
  }, [user?.mutedConversations, conversation._id]);
  if (!user) return <></>;

  return (
    <>
      <div
        className="notifications-display"
        onClick={(e) => {
          mutedConv ? handleUnmuteClick(conversation, e) : handleMuteClick(e);
        }}
      >
        <div className="li-icon">{mutedConv ? svgNotifOff : svgNotifOn}</div>
        {mutedConv ? (
          <div className="mute-container">
            <span className="mute">Réactiver les notifications</span>
            <span className="mute-until">
              Désactivées jusqu'au{" "}
              {mutedConv && (
                <span>
                  {user.mutedConversations.find((item) => item.conversationId === conversation?._id)
                    ?.untilDate && (
                    <span>
                      {formatDateMsg(
                        user.mutedConversations.find(
                          (item) => item.conversationId === conversation?._id
                        )?.untilDate
                      )}
                    </span>
                  )}{" "}
                </span>
              )}
            </span>
          </div>
        ) : (
          <span>Mettre les notifications en sourdine</span>
        )}
      </div>
      {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
    </>
  );
}

export default NotificationsDisplay;
