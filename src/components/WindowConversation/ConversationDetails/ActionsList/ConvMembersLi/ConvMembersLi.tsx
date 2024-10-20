import React, { useContext, useEffect, useRef, useState } from "react";
import {
  useDisplayedConvContext,
  UserContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import { useMessagesContext } from "../../../../../constants/context";
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
import {
  removeAdmin,
  removeMember,
  setAdmin,
} from "../../../../Utiles/ConfirmationModal/ConfirmationMessage";
import { ApiToken } from "../../../../../localStorage";
import { ConversationType, MessageType } from "../../../../../typescript/types";
import { socket } from "../../../../../socket";

export function ConvMembersLi({
  member,
  key,
}: {
  member: string;
  key: string;
}): JSX.Element {
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();
  const { messages, setMessages } = useMessagesContext();
  const btnRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const showModalRef = useRef(showModal);
  const user = useContext(UserContext);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [confirmationModalAction, setConfirmationModalAction] = useState<{
    title: string;
    text: string;
    action: () => void;
    closeModal: () => void;
  }>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => setShowConfirmationModal(false),
  });

  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const leaveConv = async (
    conversationId: string,
    username: string,
    userId: string
  ): Promise<false | string[]> => {
    try {
      const response = await fetch(
        RESTAPIUri + "/conversation/leaveConversation",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + ApiToken(),
          },
          body: JSON.stringify({
            conversationId: conversationId,
            username: username,
            userId: userId,
          }),
        }
      );
      if (!response.ok) {
        const errorMsg = await response.json();
        throw new Error(errorMsg.message);
      }
      const jsonData = await response.json();
      //console.log(jsonData.members);
      return jsonData.members;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return false;
    }
  };

  const removeUser = async (
    conversationId: string,
    removerUsername: string,
    removerUserId: string,
    removedUsername: string
  ): Promise<false | string[]> => {
    try {
      const response = await fetch(RESTAPIUri + "/conversation/removeUser", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify({
          conversationId: conversationId,
          removerUsername: removerUsername,
          removerUserId: removerUserId,
          removedUsername: removedUsername,
          date: new Date(),
        }),
      });
      if (!response.ok) {
        const errorMsg = await response.json();
        throw new Error(errorMsg.message);
      }
      const jsonData = await response.json();
      const updatedConv = jsonData.conversation;
      updatedConv.lastMessage = jsonData.message;
      setShowConfirmationModal(false);
      setDisplayedConv(updatedConv);
      setMostRecentConv(updatedConv);
      setMessages((prev) => {
        return [...prev, jsonData.message];
      });
      emitToSockets("membersChange", updatedConv); //--------------

      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return false;
    }
  };

  const setUserAdmin = async (
    conversationId: string | undefined,
    addedUsername: string,
    userId: string | undefined,
    username: string | undefined
  ) => {
    if (!conversationId || !addedUsername || !userId || !username) return;
    //console.log("allo");
    try {
      const response = await fetch(RESTAPIUri + "/conversation/setAdmin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify({
          conversationId,
          addedUsername,
          userId,
          username,
        }),
      });

      if (!response.ok) {
        const errorMsg = await response.json();
        throw new Error(errorMsg.message);
      }
      const jsonData = await response.json();
      //console.log(jsonData);
      setShowConfirmationModal(false);
      setDisplayedConv((prev) => {
        if (prev) {
          return {
            ...prev,
            admin: jsonData,
          };
        }
        return prev;
      });
      //console.log("emitting");
      emitToSockets("adminChange", [jsonData, conversationId]);
      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return false;
    }
  };

  const removeUserAdmin = async (
    conversationId: string,
    removerUsername: string,
    removerUserId: string,
    removedUsername: string
  ): Promise<void> => {
    /*  console.log(
      conversationId,
      removerUsername,
      removedUsername,
      removerUserId
    ); */
    try {
      const response = await fetch(RESTAPIUri + "/conversation/removeAdmin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify({
          conversationId: conversationId,
          username: removerUsername,
          removerUserId: removerUserId,

          removedUsername: removedUsername,
        }),
      });

      if (!response.ok) {
        const errorMsg = await response.json();
        throw new Error(errorMsg.message);
      }

      const jsonData = await response.json();
      setDisplayedConv((prev) => {
        if (prev) {
          return {
            ...prev,
            admin: jsonData,
          };
        }
        return prev;
      });
      setShowConfirmationModal(false);
      //console.log("emitting");
      emitToSockets("adminChange", [jsonData, conversationId]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
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
          title: setAdmin.title,
          text: setAdmin.text,
          action: () =>
            setUserAdmin(displayedConv._id, member, user._id, user.userName),
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "removeAdmin":
        setShowConfirmationModal(true);

        setConfirmationModalAction({
          title: removeAdmin.title,
          text: removeAdmin.text,
          action: () =>
            removeUserAdmin(displayedConv._id, user.userName, user._id, member),
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "removeMember":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: removeMember.title,
          text: removeMember.text,
          action: () =>
            removeUser(displayedConv._id, user.userName, user._id, member),
          closeModal: () => setShowConfirmationModal(false),
        });
    }

    return true;
  };

  const getUsersSocket = async (
    conversation: ConversationType | null
  ): Promise<{ userName: string; socketId: string }[] | false> => {
    if (!conversation || !user) return false;

    const convMembersStr = conversation.members
      ?.filter((member) => member !== user.userName)
      .join("-");
    try {
      const response = await fetch(
        RESTAPIUri + "/user/getSockets?convMembers=" + convMembersStr,
        {
          headers: {
            Authorization: "Bearer " + ApiToken(),
          },
        }
      );
      const jsonData = await response.json();
      //console.log("ICI SOCKET");
      //console.log(jsonData);

      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return false;
    }
  };

  const emitToSockets = async (eventName: string, data: any): Promise<void> => {
    if (!displayedConv || !user) return;

    const convMembersSocket = await getUsersSocket(displayedConv);
    if (!convMembersSocket) return;
    socket.emit(eventName, [convMembersSocket, data]);
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
      if (displayedConv.admin[0] === a && displayedConv.admin[0] !== b)
        return -1;
      if (displayedConv.admin[0] === b && displayedConv.admin[0] !== a)
        return 1;
      if (displayedConv.admin.includes(a) && !displayedConv.admin.includes(b))
        return -1;
      if (!displayedConv.admin.includes(a) && displayedConv.admin.includes(b))
        return 1;
      return a.localeCompare(b);
    });
  }

  return (
    <div style={{ position: "relative" }} key={key}>
      <button onClick={() => console.log(messages)}>
        CLICKEZ BANDE DE SALOPE
      </button>
      <li className="li-members">
        <div className="li-members-img">
          <div className="li-members-img-container"></div>
        </div>
        <div className="li-members-text">
          <span className="members-name">{member}</span>
          <span className="members-role">
            {displayedConv.admin.includes(member)
              ? displayedConv.admin[0] === member
                ? "Super Admin"
                : "Admin"
              : "Membre"}
          </span>
        </div>

        <div className="li-members-icon" ref={btnRef}>
          <div
            className="li-members-icon-btn"
            onClick={() => setShowModal(!showModal)}
          >
            <EllipsisHorizontal color={"#00000"} />
          </div>
          {showModal &&
            (user?.userName === member ? (
              <div className="li-members-options-modal">
                <ul className="ul-members-options">
                  <li
                    className="li-members-options"
                    onClick={() => {
                      leaveConv(displayedConv._id, user.userName, user._id);
                    }}
                  >
                    <div className="members-options-icon">
                      <ExitOutline
                        color={"#00000"}
                        height={"1.75rem"}
                        width={"1.75rem"}
                      />
                    </div>
                    Quitter le groupe
                  </li>
                </ul>
              </div>
            ) : (
              <div className="li-members-options-modal">
                <ul className="ul-members-options">
                  <li className="li-members-options">
                    <div className="members-options-icon">
                      <ChatbubbleOutline
                        color={"#00000"}
                        height={"1.75rem"}
                        width={"1.75rem"}
                      />
                    </div>
                    Envoyer un message
                  </li>
                  <li className="li-members-options">
                    <div className="members-options-icon">
                      <CloseCircleOutline
                        color={"#00000"}
                        height={"1.75rem"}
                        width={"1.75rem"}
                      />
                    </div>
                    Bloquer
                  </li>
                  {user.userName && displayedConv.admin[0] == user.userName && (
                    <>
                      {" "}
                      <li className="separation-bar"></li>
                      {displayedConv.admin.includes(member) ? (
                        <li
                          className="li-members-options"
                          onClick={() => handleActions("removeAdmin", member)}
                        >
                          <div className="members-options-icon">
                            <ShieldOutline
                              color={"#00000"}
                              height={"1.75rem"}
                              width={"1.75rem"}
                            />
                          </div>
                          Retirer l'admin
                        </li>
                      ) : (
                        <li
                          className="li-members-options"
                          onClick={() => handleActions("setAdmin", member)}
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
                    !displayedConv.admin.includes(member) && (
                      <li
                        className="li-members-options"
                        onClick={() => {
                          handleActions("removeMember", member);
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
