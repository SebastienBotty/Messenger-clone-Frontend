import React, { useContext, useEffect, useState } from "react";
import {
  Close,
  CreateOutline,
  EllipsisHorizontal,
  SearchOutline,
} from "react-ionicons";
import { ConversationType } from "../../typescript/types";
import "./SideBarConversations.css";

import { ApiToken } from "../../localStorage";
import {
  useDisplayedConvContext,
  UserContext,
  useMostRecentConvContext,
  useTriggerContext,
} from "../../screens/userLoggedIn/userLoggedIn";

import { socket } from "../../socket";

function SideBarConversations() {
  const userData = useContext(UserContext);
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();
  const { trigger, setTrigger } = useTriggerContext();
  const RESTAPIUri: string | undefined = process.env.REACT_APP_REST_API_URI;
  const [searchConversationInput, setSearchConversationInput] =
    useState<string>("");
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
  const fetchConversationLastMsg = async (
    conversationArr: ConversationType[]
  ) => {
    const responseArr: ConversationType[] = [];
    for (let conversation of conversationArr) {
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
        responseArr.push(conversationObject);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    }
    responseArr
      .sort((a, b) => {
        return (
          new Date(a.lastMessage.date).getTime() -
          new Date(b.lastMessage.date).getTime()
        );
      })
      .reverse();
    return responseArr;
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
      console.log(jsonData);
      /* for (let x of jsonData) {
        fetchConversationLastMsg(x);
      } */
      const test = await fetchConversationLastMsg(jsonData);
      setDisplayedConv(test[0]);
      setConversations((prev) => [...test, ...prev]);
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

  const editConvLastMsg = async (lastConv: ConversationType) => {
    const filteredConvArr = [...conversations].filter(
      (conversation) => conversation._id !== lastConv._id
    );
    const conv = await fetchConversationLastMsg([lastConv]);
    filteredConvArr.unshift(...conv);
    setConversations(filteredConvArr);
  };

  useEffect(() => {
    fetchConversationsId();
    return () => {};
  }, []);

  /**
   * Renders a single conversation item.
   *
   * @param {ConversationType} conversation - The conversation object to render.
   * @param {number} index - The index of the conversation in the conversations array.
   * @return {JSX.Element} The rendered conversation item.
   */
  const conversationsMap = (conversation: ConversationType, index: number) => {
    return (
      <div
        key={conversation._id}
        className="conversation"
        onClick={() => {
          setDisplayedConv(conversation);
          console.log("ON CLICK CONV : " + conversation._id);
        }}
        id={
          conversation._id === displayedConv?._id ? "selected-conversation" : ""
        }
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
              {conversation.isGroupConversation
                ? conversation.lastMessage.author +
                  ": " +
                  conversation.lastMessage.text
                : conversation.lastMessage.text}
            </div>
            - {timeSince(conversation.lastMessage.date)}
          </div>
        </div>
      </div>
    );
  };
  /**
   * Filters a conversation based on the search input.
   *
   * @param {ConversationType} conversation - The conversation to filter.
   * @return {boolean} Returns true if the conversation's members contain the search input, false otherwise.
   */
  const convFilterMember = (conversation: ConversationType) => {
    return conversation.members
      .join(",")
      .toLocaleLowerCase()
      .includes(searchConversationInput.toLowerCase());
  };

  useEffect(() => {
    socket.on("message", (data) => {
      console.log("Message reçu");
      setMostRecentConv(data[1]);
    });

    return () => {
      socket.off("message");
    };
  }, [displayedConv]);

  useEffect(() => {
    if (mostRecentConv) {
      editConvLastMsg(mostRecentConv);
    }
    return () => {};
  }, [mostRecentConv, trigger]);

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
            value={searchConversationInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchConversationInput(e.target.value)
            }
          />
          {searchConversationInput && (
            <div
              id="search-input-cross"
              onClick={() => setSearchConversationInput("")}
            >
              <Close color={"#9B7575"} height="1.25rem" width="1.25rem" />
            </div>
          )}
        </div>
        <div className="third-line">
          <div className="buttons-container">
            <button className="select-conversation-type">Messagerie</button>
            <button className="select-conversation-type">Communautés</button>
          </div>
        </div>
      </div>
      <div className="conversations-container">
        {searchConversationInput
          ? conversations
              .filter((item) => convFilterMember(item))
              .map((conversation, index) =>
                conversationsMap(conversation, index)
              )
          : conversations.map((conversation, index) =>
              conversationsMap(conversation, index)
            )}
      </div>
    </div>
  );
}

export default SideBarConversations;
