import React, { useContext, useEffect, useState } from "react";
import "./ConversationDetails.css";
import {
  Search,
  Notifications,
  NotificationsOff,
  PeopleOutline,
} from "react-ionicons";
import SearchMessage from "./SearchMessage/SearchMessage";

import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";
import { useUserContext } from "../../../constants/context";
import ActionsList from "./ActionsList/ActionsList";
import MoreDetails from "./MoreDetails/MoreDetails";
import ConvMedia from "./ActionsList/ConvMedias/ConvMedia";

function ConversationDetails() {
  const { user, setUser } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const [notifications, setNotifications] = useState<boolean>(true); // NOT IMPLEMENTED YET
  const [showMoreDetailsComp, setShowMoreDetailsComp] =
    useState<boolean>(false);
  const [moreDetailsCompProps, setMoreDetailsCompProps] = useState<{
    component: React.ReactNode;
    setShowMoreDetailsComp: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
  }>({
    component: <></>,
    setShowMoreDetailsComp,
    title: "",
  });

  useEffect(() => {
    setShowMoreDetailsComp(false); // Close search message when conv is changed
    return () => {};
  }, [displayedConv]);

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
        <div className="conversation-details-container">
          <div className="conversation-details-header">
            <div className="conversation-photo-img-container">
              {displayedConv.isGroupConversation ? (
                displayedConv.customization.photo?.length > 0 ? (
                  <img
                    src={displayedConv.customization.photo}
                    className="conversation-img"
                  />
                ) : (
                  <PeopleOutline color="black" height="3rem" width="3rem" />
                )
              ) : (
                <></>
              )}
            </div>
            <div className="conversation-title">
              {displayedConv?.isGroupConversation
                ? displayedConv?.customization.conversationName
                  ? displayedConv?.customization.conversationName
                  : displayedConv?.members
                      .filter((item) => item !== user?.userName)
                      .join(", ")
                : displayedConv?.members.filter(
                    (item) => item !== user?.userName
                  )}
            </div>
            <span className="user-online">
              {displayedConv?.isGroupConversation ? "" : "Online"}
            </span>
            <div className="conversations-details-buttons">
              {" "}
              {notifications ? (
                <div className="conv-btn-actions">
                  <div
                    className="icon-button"
                    onClick={() => setNotifications(!notifications)}
                  >
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
                  <div
                    className="icon-button"
                    onClick={() => setNotifications(!notifications)}
                  >
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
                <div
                  className="icon-button"
                  onClick={() => openMoreDetailsComp("SearchMessage")}
                >
                  {" "}
                  <Search
                    color={"#00000"}
                    title="Rechercher"
                    height="1.75rem"
                    width="1.75rem"
                  />
                </div>
                <span>Rechercher</span>
              </div>
            </div>
          </div>
          <div className="conversations-details-body">
            <ActionsList openMoreDetailsComp={openMoreDetailsComp} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationDetails;
