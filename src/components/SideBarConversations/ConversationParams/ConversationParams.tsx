import React, { useEffect, useRef, useState } from "react";
import { ConversationType } from "../../../typescript/types";
import "./ConversationParams.css";
import { ExitOutline, TrashOutline } from "react-ionicons";
import { useUserContext } from "../../../constants/context";
import NotificationsDisplay from "../../Utiles/NotificationsDisplay/NotificationsDisplay";
import { leaveConv } from "../../../api/conversation";
import { ConfirmationModalPropsType } from "../../../typescript/types";
import { confirmationMessage } from "../../../constants/ConfirmationMessage";
import ConfirmationModal from "../../Utiles/ConfirmationModal/ConfirmationModal";

function ConversationParams({
  conversation,
  closeComponent,
}: {
  conversation: ConversationType;
  closeComponent: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
  });

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setTimeout(() => closeComponent(), 150); //put a timeout here otherwise when user clicks on the button, here it set the state to "" and the btn isntantly closes set it back to the value so it reopens it
    }
  };

  const handleActionsClick = (actionName: string) => {
    if (!user) return;
    switch (actionName) {
      case "leaveConv":
        setConfirmationModalProps({
          title: confirmationMessage.leaveConv.title,
          text: confirmationMessage.leaveConv.text,
          action: () => leaveConv(conversation._id, user.userName, user._id),
          closeModal: () => setShowConfirmationModal(false),
        });
        setShowConfirmationModal(true);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;
  return (
    <>
      <div className="conversation-params-dropdown" ref={ref}>
        <ul>
          <li className="conversation-params-li">
            <div className="conversation-params-action">
              <div className="conversation-params-action-icon"></div>
              <div className="conversation-params-action-text"></div>
            </div>
          </li>
          <li className="conversation-params-li">
            <div className="conversation-params-action">
              <div className="conversation-params-action-icon"></div>
              <div className="conversation-params-action-text"></div>
            </div>
          </li>
          <li className="conversation-params-li">
            <div className="conversation-params-action">
              <NotificationsDisplay
                conversation={conversation}
                outlineNotifSvg={true}
                iconSize="2rem"
              />
            </div>
          </li>
          <div className="separator"></div>

          <li className="conversation-params-li">
            <div className="conversation-params-action">
              <div className="conversation-params-action-icon">
                <TrashOutline height="2rem" width="2rem" />
              </div>
              <div className="conversation-params-action-text">Supprimer la conversation</div>
            </div>
          </li>
          {conversation.isGroupConversation && conversation.members.includes(user.userName) && (
            <li className="conversation-params-li" onClick={() => handleActionsClick("leaveConv")}>
              <div className="conversation-params-action">
                <div className="conversation-params-action-icon">
                  <ExitOutline height="2rem" width="2rem" />
                </div>
                <div className="conversation-params-action-text">Quitter la conversation</div>
              </div>
            </li>
          )}
        </ul>
      </div>
      {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
    </>
  );
}

export default ConversationParams;
