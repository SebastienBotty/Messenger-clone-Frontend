import React, { useEffect, useRef, useState } from "react";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import {
  useAddedMembersContext,
  useConversationsContext,
  useMessagesContext,
  useUserContext,
} from "../../../../../constants/context";
import "./ConvMembersLi.css";
import {
  ChatbubbleOutline,
  CloseCircleOutline,
  EllipsisHorizontal,
  ExitOutline,
  PersonRemoveOutline,
  ShieldCheckmarkOutline,
  ShieldOutline,
} from "react-ionicons";

import ConfirmationModal from "../../../../Utiles/ConfirmationModal/ConfirmationModal";
import { confirmationMessage } from "../../../../../constants/ConfirmationMessage";
import { ApiToken } from "../../../../../localStorage";
import {
  ConfirmationModalPropsType,
  ConversationMemberType,
  ConversationType,
} from "../../../../../typescript/types";
import { socket } from "../../../../../Sockets/socket";
import ProfilePic from "../../../../Utiles/ProfilePic/ProfilePic";
import {
  isPrivateConvExisting,
  leaveConv,
  patchRemoveMember,
  patchUserAdmin,
} from "../../../../../api/conversation";
import {
  updateConvAdmin,
  updateConvRemovedMembers,
  updateMostRecentConvAdmin,
  updateMostRecentConvRemovedMembers,
} from "../../../../../functions/updateConversation";
import { patchBlockUser } from "../../../../../api/user";
import { blockUser, isUserBlocked } from "../../../../../functions/user";

export function ConvMembersLi({
  member,
  key,
}: {
  member: ConversationMemberType;
  key: string;
}): JSX.Element {
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { conversations } = useConversationsContext();
  const { addedMembers, setAddedMembers } = useAddedMembersContext();
  const { messages, setMessages } = useMessagesContext();
  const btnRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const showModalRef = useRef(showModal);
  const { user, setUser } = useUserContext();
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalAction, setConfirmationModalAction] =
    useState<ConfirmationModalPropsType>({
      title: "",
      text: "",
      action: () => {},
      closeModal: () => setShowConfirmationModal(false),
    });

  const removeUser = async (
    conversationId: string,
    username: string,
    targetUserId: string,
    targetUsername: string
  ) => {
    if (!displayedConv) return;
    const res = await patchRemoveMember(conversationId, username, targetUserId, targetUsername);
    if (res) {
      setShowConfirmationModal(false);
      setDisplayedConv((prev) => updateConvRemovedMembers(prev, targetUsername, displayedConv));
      setMostRecentConv((prev) =>
        updateMostRecentConvRemovedMembers(conversations, prev, targetUsername, displayedConv)
      );
      setMessages((prev) => {
        return [...prev, res.conversation.lastMessage];
      });
    }
  };

  const changeUserAdmin = async (
    conversationId: string,
    targetUsername: string,
    userId: string,
    username: string,
    changeAdmin: boolean
  ) => {
    if (!displayedConv) return;
    console.log("changeUserAdmin");
    console.log(conversationId, targetUsername, userId, username, changeAdmin);
    const res = await patchUserAdmin(conversationId, targetUsername, userId, username, changeAdmin);
    if (res) {
      setShowConfirmationModal(false);
      setDisplayedConv((prev) => updateConvAdmin(prev, targetUsername, changeAdmin, displayedConv));
      setMostRecentConv((prev) =>
        updateMostRecentConvAdmin(conversations, prev, targetUsername, changeAdmin, displayedConv)
      );
      setShowModal(false);
    }
  };

  const handleActions = (action: string, member: string): boolean => {
    if (!displayedConv || !user) return false;
    //console.log("called" + action + " " + member);
    setShowModal(false);
    switch (action) {
      case "setAdmin":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: confirmationMessage.setAdmin.title,
          text: confirmationMessage.setAdmin.text,
          action: () => changeUserAdmin(displayedConv._id, member, user._id, user.userName, true),
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "removeAdmin":
        setShowConfirmationModal(true);

        setConfirmationModalAction({
          title: confirmationMessage.removeAdmin.title,
          text: confirmationMessage.removeAdmin.text,
          action: () => changeUserAdmin(displayedConv._id, member, user._id, user.userName, false),
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "removeMember":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: confirmationMessage.removeMember.title,
          text: confirmationMessage.removeMember.text,
          action: () => removeUser(displayedConv._id, user.userName, user._id, member),
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "leaveConv":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: confirmationMessage.leaveConv.title,
          text: confirmationMessage.leaveConv.text,
          action: () => leaveConv(displayedConv._id, member, user._id),
          closeModal: () => setShowConfirmationModal(false),
        });
    }

    return true;
  };

  const sendMessageToUser = async (member: ConversationMemberType) => {
    if (!user) return;
    const existingConv = await isPrivateConvExisting(user, [member.username]);
    if (existingConv) {
      setDisplayedConv(existingConv);
    } else {
      setDisplayedConv(null);
      setTimeout(() => {
        setAddedMembers([member.username]);
      }, 100);
    }
  };

  useEffect(() => {
    showModalRef.current = showModal; // Toujours mettre à jour la référence avec la valeur actuelle de showModal
  }, [showModal]);

  useEffect(() => {
    // Fonction pour détecter le clic en dehors du composant
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showModalRef.current &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        // Ici, tu peux gérer ce qui se passe (fermer modal, etc.)
        //console.log("Clic en dehors du bouton");
        setShowModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (!displayedConv || !user) return <></>;
  const members = displayedConv.members;

  if (members) {
    members.sort((a, b) => {
      if (displayedConv.admin[0] === a.username && displayedConv.admin[0] !== b.username) return -1;
      if (displayedConv.admin[0] === b.username && displayedConv.admin[0] !== a.username) return 1;
      if (displayedConv.admin.includes(a.username) && !displayedConv.admin.includes(b.username))
        return -1;
      if (!displayedConv.admin.includes(a.username) && displayedConv.admin.includes(b.username))
        return 1;
      return a.username.localeCompare(b.username);
    });
  }

  return (
    <div style={{ position: "relative" }} key={key}>
      <li className="li-members">
        <div className="li-members-img">
          <div className="li-members-img-container">
            <ProfilePic
              picSrc={member.photo}
              status={member.status}
              isOnline={member.isOnline}
              isGroupConversationPic={false}
            />
          </div>
        </div>
        <div className="li-members-text">
          <span className="members-name">{member.username}</span>
          <span className="members-role">
            {displayedConv.admin.includes(member.username)
              ? displayedConv.admin[0] === member.username
                ? "Propriétaire"
                : "Admin"
              : "Membre"}
          </span>
        </div>

        <div className="li-members-icon" ref={btnRef}>
          <div className="li-members-icon-btn" onClick={() => setShowModal(!showModal)}>
            <EllipsisHorizontal color={"#00000"} />
          </div>
          {showModal &&
            (user?.userName === member.username ? (
              <div className="li-members-options-modal">
                <ul className="ul-members-options">
                  <li
                    className="li-members-options"
                    onClick={() => {
                      displayedConv.admin.length === 1 && displayedConv.admin[0] === user?.userName
                        ? alert(
                            "Vous devez d'abord nomber une autre personne admin avant de quitter la conversation"
                          )
                        : handleActions("leaveConv", user.userName);
                    }}
                  >
                    <div className="members-options-icon">
                      <ExitOutline color={"#00000"} height={"1.75rem"} width={"1.75rem"} />
                    </div>
                    Quitter le groupe
                  </li>
                </ul>
              </div>
            ) : (
              <div className="li-members-options-modal">
                <ul className="ul-members-options">
                  <li className="li-members-options" onClick={() => sendMessageToUser(member)}>
                    <div className="members-options-icon">
                      <ChatbubbleOutline color={"#00000"} height={"1.75rem"} width={"1.75rem"} />
                    </div>
                    Envoyer un message
                  </li>
                  <li
                    className="li-members-options"
                    onClick={() => {
                      blockUser(member.userId, user.blockedUsers, user._id, setUser);
                    }}
                  >
                    <div className="members-options-icon">
                      <CloseCircleOutline color={"#00000"} height={"1.75rem"} width={"1.75rem"} />
                    </div>
                    {isUserBlocked(member.userId, user.blockedUsers) ? "Débloquer" : "Bloquer"}
                  </li>
                  {user.userName && displayedConv.admin[0] == user.userName && (
                    <>
                      {" "}
                      <li className="separation-bar"></li>
                      {displayedConv.admin.includes(member.username) ? (
                        <li
                          className="li-members-options"
                          onClick={() => handleActions("removeAdmin", member.username)}
                        >
                          <div className="members-options-icon">
                            <ShieldOutline color={"#00000"} height={"1.75rem"} width={"1.75rem"} />
                          </div>
                          Retirer l'admin
                        </li>
                      ) : (
                        <li
                          className="li-members-options"
                          onClick={() => handleActions("setAdmin", member.username)}
                        >
                          <div className="members-options-icon">
                            <ShieldCheckmarkOutline
                              color={"#00000"}
                              height={"1.75rem"}
                              width={"1.75rem"}
                            />
                          </div>
                          Nommer admin
                        </li>
                      )}{" "}
                    </>
                  )}
                  {displayedConv.admin.includes(user.userName) &&
                    !displayedConv.admin.includes(member.username) && (
                      <li
                        className="li-members-options"
                        onClick={() => {
                          handleActions("removeMember", member.username);
                        }}
                      >
                        <div className="members-options-icon">
                          <PersonRemoveOutline
                            color={"#00000"}
                            height={"1.75rem"}
                            width={"1.75rem"}
                          />
                        </div>
                        Supprimer le membre
                      </li>
                    )}
                </ul>
              </div>
            ))}
        </div>
      </li>
      {showConfirmationModal && (
        <ConfirmationModal
          title={confirmationModalAction.title}
          text={confirmationModalAction.text}
          action={confirmationModalAction.action}
          closeModal={confirmationModalAction.closeModal}
        />
      )}
    </div>
  );
}
