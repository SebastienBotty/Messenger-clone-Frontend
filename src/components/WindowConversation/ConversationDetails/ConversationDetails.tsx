import React, { useContext, useEffect, useState } from "react";
import "./ConversationDetails.css";
import { Search, Notifications, NotificationsOff } from "react-ionicons";
import SearchMessage from "./SearchMessage/SearchMessage";

import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";
import { UserContext } from "../../../screens/userLoggedIn/userLoggedIn";
import ActionsList from "./ActionsList/ActionsList";

function ConversationDetails() {
  const [showSearchWordComp, setShowSearchWordComp] = useState<boolean>(false);
  const { displayedConv } = useDisplayedConvContext();
  const [notifications, setNotifications] = useState<boolean>(true);
  const user = useContext(UserContext);
  useEffect(() => {
    setShowSearchWordComp(false); // Close search message when conv is changed
    return () => {};
  }, [displayedConv]);

  useEffect(() => {
    return () => {
      setShowSearchWordComp(false);
    };
  }, []);

  return (
    <div className="conversation-details">
      {showSearchWordComp ? (
        <SearchMessage setShowSearchWordComp={setShowSearchWordComp} />
      ) : (
        <div className="conversation-details-container">
          <div className="conversation-details-header">
            <div className="conversation-photo-img-container">Img</div>
            <div className="conversation-title">
              {displayedConv?.isGroupConversation
                ? displayedConv?.members
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
                  onClick={() => setShowSearchWordComp(true)}
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
            <ActionsList />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationDetails;
