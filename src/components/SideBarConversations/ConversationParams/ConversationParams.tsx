import React, { useEffect, useRef, useState } from "react";
import { ConversationType } from "../../../typescript/types";
import "./ConversationParams.css";
import { ExitOutline, PersonAddOutline, TrashOutline } from "react-ionicons";
import { useUserContext, useConversationsContext } from "../../../constants/context";
import NotificationsDisplay from "../../Utiles/NotificationsDisplay/NotificationsDisplay";
import { leaveConv } from "../../../api/conversation";
import { ConfirmationModalPropsType } from "../../../typescript/types";
import { confirmationMessage } from "../../../constants/ConfirmationMessage";
import ConfirmationModal from "../../Utiles/ConfirmationModal/ConfirmationModal";
import { deleteConversation } from "../../../api/user";
import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";
import AddMembersModal from "../../WindowConversation/ConversationDetails/ActionsList/AddMembersModal/AddMembersModal";

function ConversationParams({
  conversation,
  closeComponent,
}: {
  conversation: ConversationType;
  closeComponent: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, setUser } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setConversations } = useConversationsContext();
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
  });
  const [showAddMembersModal, setShowAddMembersModal] = useState<boolean>(false);

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
      case "deleteConv":
        setConfirmationModalProps({
          title: confirmationMessage.deleteConv.title,
          text: confirmationMessage.deleteConv.text,
          action: () => {
            deleteConversation(conversation._id, user._id, () => {
              updateConversations(conversation._id);
              deleteConvCache(conversation._id);
            });
          },
          closeModal: () => setShowConfirmationModal(false),
        });
        setShowConfirmationModal(true);
        break;
    }
  };

  //Update user conversations by removing the conversation from convId arr and put it in deletedConversations + uptade conversation Context
  const updateConversations = (convId: string) => {
    if (!user) return;
    const updatedUser = { ...user };
    console.log(updatedUser);

    updatedUser.conversations = updatedUser.conversations.filter(
      (userConvId) => userConvId !== convId
    );
    //console.log("&");
    //console.log(updatedUser.deletedConversations);
    updatedUser.deletedConversations.push({ conversationId: convId, deleteDate: new Date() });
    //console.log("&&&");
    setUser(updatedUser);
    setConversations((prev) => prev.filter((conv) => conv._id !== convId));
    if (displayedConv?._id == convId) setDisplayedConv(null);
    //console.log("updatedUser");
  };

  const deleteConvCache = (convId: string) => {
    const cacheFilesKey = `filesCache_${convId}`;
    const cacheMediasKey = `mediasCache_${convId}`;
    sessionStorage.removeItem(cacheFilesKey);
    sessionStorage.removeItem(cacheMediasKey);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;
  return (
    <div ref={ref} onClick={(e) => e.stopPropagation()}>
      <div className="conversation-params-dropdown">
        <ul>
          {conversation.isGroupConversation && conversation.admin.includes(user.userName) && (
            <li className="conversation-params-li" onClick={() => setShowAddMembersModal(true)}>
              <div className="conversation-params-action">
                <div className="conversation-params-action-icon">
                  {" "}
                  <PersonAddOutline color={"#00000"} />
                </div>
                <div className="conversation-params-action-text">Ajouter des membres</div>
              </div>
            </li>
          )}
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

          <li className="conversation-params-li" onClick={() => handleActionsClick("deleteConv")}>
            <div className="conversation-params-action">
              <div className="conversation-params-action-icon">
                <TrashOutline height="2rem" width="2rem" />
              </div>
              <div className="conversation-params-action-text">Supprimer la conversation</div>
            </div>
          </li>
          {conversation.isGroupConversation &&
            conversation.members.some((member) => member.username === user.userName) && (
              <li
                className="conversation-params-li"
                onClick={() => handleActionsClick("leaveConv")}
              >
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
      {(showConfirmationModal || showAddMembersModal) && (
        <div className="conversation-params-modal">
          {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
          {showAddMembersModal && (
            <AddMembersModal
              conversation={conversation}
              closeModal={() => setShowAddMembersModal(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationParams;
