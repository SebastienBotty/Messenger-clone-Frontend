import React, { useContext, useEffect, useRef, useState } from "react";
import {
  useDisplayedConvContext,
  UserContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import "./ConvMembersLi.css";
import {
  ChatbubbleOutline,
  CloseCircleOutline,
  EllipsisHorizontal,
  ExitOutline,
  PersonRemoveOutline,
  ShieldCheckmarkOutline,
} from "react-ionicons";
import { ApiToken } from "../../../../../localStorage";

export function ConvMembersLi({
  member,
  key,
}: {
  member: string;
  key: string;
}): JSX.Element {
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const btnRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const showModalRef = useRef(showModal);
  const user = useContext(UserContext);

  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const handleLeaveClick = async (
    conversationId: string,
    username: string,
    userId: string
  ) => {
    const leave = await leaveConv(conversationId, username, userId);
    if (leave) {
      setDisplayedConv((prev) => {
        if (prev) {
          return {
            ...prev,
            members: leave,
          };
        }
        return prev;
      });
    }
  };
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
      console.log(jsonData.members);
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

  const handleRemoveUserClick = async (
    conversationId: string,
    removerUsername: string,
    removerUserId: string,
    removedUsername: string
  ) => {
    const leave = await removeUser(
      conversationId,
      removerUsername,
      removerUserId,
      removedUsername
    );
    if (leave) {
      setDisplayedConv((prev) => {
        if (prev) {
          return {
            ...prev,
            members: leave,
          };
        }
        return prev;
      });
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
        }),
      });
      if (!response.ok) {
        const errorMsg = await response.json();
        throw new Error(errorMsg.message);
      }
      const jsonData = await response.json();
      console.log(jsonData.members);
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
        console.log("Clic en dehors du bouton");
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
      if (displayedConv.admin.includes(a) && !displayedConv.admin.includes(b))
        return -1;
      if (!displayedConv.admin.includes(a) && displayedConv.admin.includes(b))
        return 1;
      return a.localeCompare(b);
    });
  }

  return (
    <div style={{ position: "relative" }} key={key}>
      <li className="li-members">
        <div className="li-members-img">
          <div className="li-members-img-container"></div>
        </div>
        <div className="li-members-text">
          <span className="members-name">{member}</span>
          <span className="members-role">
            {displayedConv.admin.includes(member)
              ? "Créateur du groupe"
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
                  {user?.userName &&
                    displayedConv.admin.includes(user.userName) && (
                      <>
                        {" "}
                        <li className="separation-bar"></li>
                        <li className="li-members-options">
                          <div className="members-options-icon">
                            <ShieldCheckmarkOutline
                              color={"#00000"}
                              height={"1.75rem"}
                              width={"1.75rem"}
                            />
                          </div>
                          Nommer admin
                        </li>
                        <li
                          className="li-members-options"
                          onClick={() => {
                            handleRemoveUserClick(
                              displayedConv._id,
                              user.userName,
                              user._id,
                              member
                            );
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
                      </>
                    )}
                </ul>
              </div>
            ))}
        </div>
      </li>
    </div>
  );
}
