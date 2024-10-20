import React, { useContext, useEffect, useState } from "react";
import {
  Close,
  CreateOutline,
  EllipsisHorizontal,
  Search,
} from "react-ionicons";
import { ConversationType, SideBarPropsType } from "../../typescript/types";
import "./SideBarConversations.css";

import { ApiToken } from "../../localStorage";
import {
  useDisplayedConvContext,
  UserContext,
  useMostRecentConvContext,
  useTriggerContext,
  useRecentConversationContext,
} from "../../screens/userLoggedIn/userLoggedIn";
import { timeSince } from "../../functions/time";
import { socket } from "../../socket";

function SideBarConversations({ setShowConversationWindow }: SideBarPropsType) {
  const userData = useContext(UserContext);
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();
  const { recentConversations, setRecentConversations } =
    useRecentConversationContext();
  const { trigger, setTrigger } = useTriggerContext();
  const RESTAPIUri: string | undefined = process.env.REACT_APP_REST_API_URI;
  const [searchConversationInput, setSearchConversationInput] =
    useState<string>("");
  const [conversations, setConversations] = useState<ConversationType[]>([]);

  const notificationSound = new Audio("notification.wav");

  const authApiToken = ApiToken();

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
      //console.log("CONVERSATIONS");
      //console.log(jsonData);
      const test = await fetchConversationLastMsg(jsonData);
      setDisplayedConv(test[0]);
      setConversations((prev) => [...test, ...prev]);
      set5LatestConversation(test);
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
      if (jsonData[0].conversations.length > 0) {
        fetchConversations(jsonData[0].conversations);
      } else {
        setShowConversationWindow(true);
      }
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
    lastConv.lastMessage.date = new Date(conv[0].lastMessage.date);
    filteredConvArr.unshift(lastConv);
    setConversations(filteredConvArr);
  };

  const handleConversationClick = async (conversation: ConversationType) => {
    //console.log(conversation.lastMessage);
    if (conversation.lastMessage._id && userData?._id && userData?.userName) {
      setDisplayedConv(conversation);

      if (!conversation.lastMessage.seenBy.includes(userData?.userName)) {
        updateSeenConversation(conversation.lastMessage._id, conversation);
      }
    }
  };
  const markMessagesAsSeen = async (
    messageId: string,
    userId: string,
    username: string
  ) => {
    try {
      const response = await fetch(
        RESTAPIUri + "/message/userId/" + userId + "/markMessageAsSeen",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + ApiToken(),
          },
          body: JSON.stringify({
            messageId: messageId,
            username: username,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors du PATCH markMessagesAsSeen");
      }
      const jsonData = await response.json();
      //console.log(jsonData);
      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };
  const updateSeenConversation = async (
    messageId: string,
    conversation: ConversationType
  ) => {
    if (userData) {
      const setMsgSeen = await markMessagesAsSeen(
        messageId,
        userData._id,
        userData.userName
      );
      if (setMsgSeen) {
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv._id === conversation._id) {
              return {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  seenBy: setMsgSeen.seenBy,
                },
              };
            }
            return conv;
          });
        });
      }
    }
  };

  const set5LatestConversation = (
    arrConversations: ConversationType[]
  ): void => {
    let sortedConvArr = [...arrConversations].sort((a, b) => {
      return (
        new Date(b.lastMessage.date).getTime() -
        new Date(a.lastMessage.date).getTime()
      );
    });
    //console.log(sortedConvArr.slice(0, 5).reverse());
    setRecentConversations(sortedConvArr.slice(0, 5));
  };

  const update5LatestConversations = (conversation: ConversationType): void => {
    if (recentConversations) {
      let recentConvs = [...recentConversations];
      recentConvs.push(conversation);
      recentConvs.shift();
      //console.log("UPDATE 5 LATEST CONVERSATIONS  RECENT CONVERSATIONS");
      //console.log(recentConvs);
      setRecentConversations(recentConvs);
    }
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
        key={conversation._id + "-" + index}
        className="conversation"
        onClick={() => {
          handleConversationClick(conversation);
          //console.log("ON CLICK CONV : " + conversation._id);
        }}
        id={
          conversation._id === displayedConv?._id ? "selected-conversation" : ""
        }
      >
        <div className="conversation-img-container">
          <img src={conversation.photo} />
        </div>
        <div className="conversation-text-container">
          <div className="conversation-name">
            {conversation.members
              .filter((item) => item !== userData?.userName)
              .join(", ")}
          </div>
          <div id="conversation-last-message">
            <div
              className="truncated-text"
              id={
                conversation.lastMessage.seenBy.includes(userData?.userName)
                  ? "seen"
                  : "unseen-conversation"
              }
            >
              {conversation.isGroupConversation
                ? (conversation.lastMessage.author === userData?.userName
                    ? "Vous"
                    : conversation.lastMessage.author) +
                  ": " +
                  (conversation.lastMessage.text.startsWith(
                    "PATHIMAGE/" + conversation._id
                  )
                    ? " Fichier joint"
                    : conversation.lastMessage.text)
                : conversation.lastMessage.text.startsWith(
                    "PATHIMAGE/" + conversation._id
                  )
                ? " Fichier joint"
                : conversation.lastMessage.text}
            </div>
            - {timeSince(conversation.lastMessage.date)}
            {!conversation.lastMessage.seenBy.includes(userData?.userName) && (
              <div className="unseen-conversation-notification"></div>
            )}
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
  const moreThanOneMinBetween = (date1: Date, date2: Date): boolean => {
    const differenceInMilliseconds = Math.abs(
      date2.getTime() - date1.getTime()
    );
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
    return differenceInMinutes > 1;
  };
  useEffect(() => {
    socket.on("message", (data) => {
      //console.log("Message reçu");
      //console.log(data[0]);
      //console.log(data[1]);
      //console.log(data[2]);
      if (data[2]) {
        if (
          moreThanOneMinBetween(new Date(data[0].date), new Date(data[2].date))
        ) {
          notificationSound.play();
        }
      } else {
        notificationSound.play();
      }
      if (displayedConv?._id === data[0].conversationId) {
        // On new message, if the displayed conversation is the one with the new message, update the last message and mark it as seen
        updateSeenConversation(data[0]._id, data[1]);
      }
      setMostRecentConv(data[1]);
    });

    socket.on("membersChange", (conversation: ConversationType) => {
      if (!conversation || !conversation.lastMessage._id) return;
      if (conversation._id === displayedConv?._id) {
        console.log("MEMBERS CHANGE");
        updateSeenConversation(conversation.lastMessage._id, conversation);
        setDisplayedConv(conversation);
        setMostRecentConv(conversation);
      }
    });

    return () => {
      socket.off("message");
      socket.off("membersChange");
    };
  }, [displayedConv?._id]);

  useEffect(() => {
    if (mostRecentConv) {
      editConvLastMsg(mostRecentConv);
      update5LatestConversations(mostRecentConv);
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
            <div className="test">
              {" "}
              <Search color={"#65676b"} />
            </div>
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
            <div className="search-input-cross-container">
              {" "}
              <div
                id="search-input-cross"
                onClick={() => setSearchConversationInput("")}
              >
                <Close color={"#9B7575"} height="1.5rem" width="1.5rem" />
              </div>
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
              .sort((a, b) => {
                // If either a or b has test: true, it should come first
                if (a.isGroupConversation) return 1;
                if (b.isGroupConversation) return -1;

                // If neither has test: true, sort by date
                return (
                  new Date(a.lastMessage.date).getTime() -
                  new Date(b.lastMessage.date).getTime()
                );
              })
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
