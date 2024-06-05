import React, { useContext, useEffect, useState } from "react";
import {
  CreateOutline,
  EllipsisHorizontal,
  SearchOutline,
} from "react-ionicons";
import { ConversationType, MessageType } from "../../typescript/types";
import "./SideBarConversations.css";

import { ApiToken } from "../../localStorage";
import {
  useDisplayedConvContext,
  UserContext,
} from "../../screens/userLoggedIn/userLoggedIn";

function SideBarConversations() {
  const userData = useContext(UserContext);
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const RESTAPIUri: string | undefined = process.env.REACT_APP_REST_API_URI;
  const [searchConversation, setSearchConversation] = useState<string>("");
  const [conversations, setConversations] = useState<ConversationType[]>([]);

  const authApiToken = ApiToken();

  const timeSince = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: "semaine", seconds: 604800 },
      { label: "jour", seconds: 86400 },
      { label: "heure", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        switch (interval.label) {
          case "minute":
            return count === 1 ? "1m" : `${count}min`;
          case "heure":
            return count === 1 ? "1h" : `${count}h`;
          case "jour":
            return count === 1 ? "1j" : `${count}j`;
          case "semaine":
            return count === 1 ? "1sem" : `${count}sem`;

          default:
            return "Il y a un certain temps";
        }
      }
    }

    return "A l'instant";
  };
  /**
   * Retrieves the value of a cookie by its name.
   *
   * @param {string} name - The name of the cookie to retrieve.
   * @return {string | null} The value of the cookie, or null if it does not exist.
   */

  useEffect(() => {
    const fetchConversationLastMsg = async (conversation: ConversationType) => {
      try {
        const response = await fetch(
          RESTAPIUri +
            "/conversation/userId/" +
            userData?._id +
            "/conversation/lastMessage?conversationId=" +
            conversation._id,
          {
            headers: {
              Authorization: `Bearer ${authApiToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors du fetch");
        }
        const jsonData = await response.json();
        let conversationObject = conversation;
        conversationObject.lastMessage = jsonData;
        conversationObject.lastMessage.date = new Date(
          conversationObject.lastMessage.date
        );
        setConversations((prev) => [...prev, conversationObject]);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };
    const fetchConversations = async (idsArray: string[]) => {
      const conversationsIdStr: string = idsArray.join("-");
      try {
        const response = await fetch(
          RESTAPIUri +
            "/conversation/userId/" +
            userData?._id +
            "/getConversations?conversationsId=" +
            conversationsIdStr,
          {
            headers: {
              Authorization: `Bearer ${authApiToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors du fetch");
        }
        const jsonData = await response.json();
        console.log("CONVERSATIONS");
        console.log(conversations);
        for (let x of jsonData) {
          fetchConversationLastMsg(x);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };

    const fetchConversationsId = async () => {
      try {
        const response = await fetch(
          RESTAPIUri + "/user/userConversationsId/userId/" + userData?._id,
          {
            headers: {
              Authorization: `Bearer ${authApiToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors du fetch");
        }
        const jsonData = await response.json();
        fetchConversations(jsonData[0].conversations);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };

    fetchConversationsId();

    return () => {};
  }, []);

  return (
    <div className="SideBarConversations">
      <div className="sideBar-header">
        <div className="first-line">
          <div className="first-line-title">Discussions</div>
          <div className="sideBar-header-buttons">
            <button>
              <EllipsisHorizontal
                color={"#00000"}
                title="Paramètres"
                height="2rem"
                width="2rem"
              />
            </button>

            <button onClick={() => setDisplayedConv(null)}>
              <CreateOutline
                color={"#00000"}
                title="Nouvelle discussion"
                height="2rem"
                width="2rem"
              />
            </button>
          </div>
        </div>
        <div className="second-line">
          <label
            htmlFor="search-conversations"
            className="search-conversations-label"
          >
            <SearchOutline color={"#00000"} height="1.5rem" width="1.5rem" />
          </label>
          <input
            className="search-conversations"
            id="search-conversations"
            type="text"
            placeholder="Rechercher dans Messenger"
            value={searchConversation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchConversation(e.target.value)
            }
          />
        </div>
        <div className="third-line">
          <div className="buttons-container">
            <button className="select-conversation-type">Messagerie</button>
            <button className="select-conversation-type">Communautés</button>
          </div>
        </div>
      </div>
      <div className="conversations-container">
        {conversations
          .sort((a, b) => {
            return (
              new Date(b.lastMessage.date).getTime() -
              new Date(a.lastMessage.date).getTime()
            );
          })
          .map((conversation: ConversationType, index: number) => {
            /*             if (index === 0) {
              setDisplayedConv(conversation);
            } */
            return (
              <div
                key={conversation._id}
                className="conversation"
                onClick={() => {
                  setDisplayedConv(conversation);
                  console.log("ON CLICK CONV : " + conversation._id);
                }}
              >
                <div className="conversation-img-container">
                  <img src={conversation.photo} />
                </div>
                <div className="conversation-text-container">
                  <div id="conversation-name">
                    {conversation.members
                      .filter((item) => item !== userData?.userName)
                      .join(", ")}
                  </div>
                  <div id="conversation-last-message">
                    <div className="truncated-text">
                      {conversation.lastMessage.text}
                    </div>
                    - {timeSince(conversation.lastMessage.date)}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default SideBarConversations;
