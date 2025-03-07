import React, { useEffect, useState } from "react";
import "./ConversationDetails.css";
import { Search, Notifications, NotificationsOff } from "react-ionicons";
import SearchMessage from "./SearchMessage/SearchMessage";

import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";
import { useUserContext } from "../../../constants/context";
import ActionsList from "./ActionsList/ActionsList";
import MoreDetails from "./MoreDetails/MoreDetails";
import ConvMedia from "./ActionsList/ConvMedias/ConvMedia";
import ProfilePic from "../../Utiles/ProfilePic/ProfilePic";
import MuteConversation from "../../MuteConversation/MuteConversation";
import ConfirmationModal from "../../Utiles/ConfirmationModal/ConfirmationModal";
import { muteConv } from "../../../constants/ConfirmationMessage";
import { ApiToken } from "../../../localStorage";
import { isConvMuted } from "../../../functions/conversation";
import { ConfirmationModalPropsType } from "../../../typescript/types";
import { getNickNameByUsername } from "../../../functions/StrFormatter";
import { statusTranslate } from "../../../constants/status";

function ConversationDetails() {
  const { user, setUser } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const [notifications, setNotifications] = useState<boolean>(); // NOT IMPLEMENTED YET
  const [showMoreDetailsComp, setShowMoreDetailsComp] = useState<boolean>(false);
  const [moreDetailsCompProps, setMoreDetailsCompProps] = useState<{
    component: React.ReactNode;
    setShowMoreDetailsComp: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
  }>({
    component: <></>,
    setShowMoreDetailsComp,
    title: "",
  });

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationsModalAction, setNotificationsModalAction] =
    useState<ConfirmationModalPropsType>({
      title: "",
      text: "",
      action: () => {},
      closeModal: () => setShowNotificationsModal(false),
    });

  const isPrivateConv = !displayedConv?.isGroupConversation;
  let partner;
  if (isPrivateConv) {
    partner = displayedConv?.members.find((member) => member.userId !== user?._id);
  }

  const openNotificationsModal = () => {
    if (!displayedConv) return;
    setShowNotificationsModal(true);
    setNotificationsModalAction({
      title: muteConv.title,
      text: (
        <MuteConversation
          closeModal={() => setShowNotificationsModal(false)}
          conversationId={displayedConv._id}
        />
      ),
      action: () => {},
      closeModal: () => setShowNotificationsModal(false),
    });
  };

  const unmuteConversation = async () => {
    if (!displayedConv || !user) return;
    try {
      const response = await fetch(
        RESTAPIUri + "/user/userId/" + user._id + "/unmuteConversation",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${ApiToken()}`,
          },
          body: JSON.stringify({
            conversationId: displayedConv._id,
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setUser((prev) => {
        if (prev)
          return {
            ...prev,
            mutedConversations: prev.mutedConversations.filter(
              (item) => item.conversationId !== displayedConv._id
            ),
          };
        return prev;
      });
      setNotifications(true);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    setShowMoreDetailsComp(false); // Close search message when conv is changed
    return () => {};
  }, [displayedConv]);

  useEffect(() => {
    const mutedConv = isConvMuted(user?.mutedConversations, displayedConv?._id);
    setNotifications(!mutedConv);

    return () => {};
  }, [displayedConv, user?.mutedConversations]);

  useEffect(() => {
    return () => {
      setShowMoreDetailsComp(false);
    };
  }, []);

  const openMoreDetailsComp = (componentName: string) => {
    console.log("called");
    switch (componentName) {
      case "SearchMessage":
        setMoreDetailsCompProps({
          component: <SearchMessage />,
          setShowMoreDetailsComp,
          title: "Rechercher",
        });
        setShowMoreDetailsComp(true);
        break;

      case "ConvMedia-Medias": // Could be done a better way but im tired and lazy atm
        setMoreDetailsCompProps({
          component: <ConvMedia mediaType="Medias" />,
          setShowMoreDetailsComp,
          title: "Contenu multimédia et  fichiers",
        });
        setShowMoreDetailsComp(true);
        break;
      case "ConvMedia-Files":
        setMoreDetailsCompProps({
          component: <ConvMedia mediaType="Files" />,
          setShowMoreDetailsComp,
          title: "Contenu multimédia et  fichiers",
        });
        setShowMoreDetailsComp(true);
        break;
    }
  };

  if (!displayedConv || !user) {
    return <></>;
  }
  return (
    <div className="conversation-details">
      {showMoreDetailsComp ? (
        <MoreDetails {...moreDetailsCompProps} />
      ) : (
        <>
          <div className="conversation-details-container">
            <div className="conversation-details-header">
              <div
                className="conversation-photo-img-container"
                onClick={() => {
                  console.log(displayedConv);
                }}
              >
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
              <div className="conversation-title">
                {displayedConv?.isGroupConversation
                  ? displayedConv?.customization.conversationName
                    ? displayedConv?.customization.conversationName
                    : displayedConv?.members
                        .filter((item) => item.username !== user?.userName)
                        .map((member) =>
                          getNickNameByUsername(displayedConv.members, member.username)
                        )
                        .join(", ")
                  : displayedConv?.members
                      .filter((item) => item.username !== user?.userName)
                      .map((member) =>
                        getNickNameByUsername(displayedConv.members, member.username)
                      )}
              </div>
              <span className="user-online">
                {displayedConv?.isGroupConversation
                  ? ""
                  : statusTranslate(
                      displayedConv.members.find((member) => member.userId !== user?._id)?.status
                    )}
              </span>
              <div className="conversations-details-buttons">
                {" "}
                {notifications ? (
                  <div className="conv-btn-actions">
                    <div className="icon-button" onClick={() => openNotificationsModal()}>
                      <Notifications
                        color={"#00000"}
                        title="Notifications"
                        height="1.75rem"
                        width="1.75rem"
                      />
                    </div>
                    <span>Mettre en sourdine</span>
                  </div>
                ) : (
                  <div className="conv-btn-actions">
                    {" "}
                    <div className="icon-button" onClick={() => unmuteConversation()}>
                      <NotificationsOff
                        color={"#00000"}
                        title="Notifications"
                        height="1.75rem"
                        width="1.75rem"
                      />
                    </div>
                    <span>Réactiver</span>
                  </div>
                )}
                <div className="conv-btn-actions">
                  <div className="icon-button" onClick={() => openMoreDetailsComp("SearchMessage")}>
                    {" "}
                    <Search color={"#00000"} title="Rechercher" height="1.75rem" width="1.75rem" />
                  </div>
                  <span>Rechercher</span>
                </div>
              </div>
            </div>
            <div className="conversations-details-body">
              <ActionsList openMoreDetailsComp={openMoreDetailsComp} />
            </div>
          </div>
          {showNotificationsModal && <ConfirmationModal {...notificationsModalAction} />}
        </>
      )}
    </div>
  );
}

export default ConversationDetails;
