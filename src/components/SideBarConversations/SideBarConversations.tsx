import React, { useEffect, useState } from "react";
import { Close, CreateOutline, EllipsisHorizontal, NotificationsOff, Search } from "react-ionicons";
import {
  ConversationMemberType,
  ConversationType,
  CustomizationType,
  MessageType,
  SideBarPropsType,
} from "../../typescript/types";
import "./SideBarConversations.css";

import { ApiToken } from "../../localStorage";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
  useTriggerContext,
  useRecentConversationContext,
} from "../../screens/userLoggedIn/userLoggedIn";
import {
  useConversationsContext,
  useMessagesContext,
  useUserContext,
} from "../../constants/context";
import { timeSince } from "../../functions/time";
import { socket } from "../../Sockets/socket";
import ConvSystemMsg from "../WindowConversation/ConvSystemMsg/ConvSystemMsg";
import ProfilePic from "../Utiles/ProfilePic/ProfilePic";
import { isConvMuted } from "../../functions/conversation";
import ConversationParams from "./ConversationParams/ConversationParams";
import { getMessageText, getNickNameByUsername } from "../../functions/StrFormatter";
import SeenByMember from "../Utiles/SeenByMember/SeenByMember";
import {
  updateConv,
  updateConvAddedMembers,
  updateConvRemovedMembers,
  updateMostRecentConv,
  updateMostRecentConvRemovedMembers,
  updateMostRecentConvAddedMembers,
  updateConvCustomization,
  updateMostRecentConvCustomization,
  updateConvAdmin,
  updateMostRecentConvAdmin,
} from "../../functions/updateConversation";

function SideBarConversations({ setShowConversationWindow }: SideBarPropsType) {
  const { user, setUser } = useUserContext();
  const { conversations, setConversations } = useConversationsContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();
  const { recentConversations, setRecentConversations } = useRecentConversationContext();
  const { messages, setMessages } = useMessagesContext();
  const { trigger, setTrigger } = useTriggerContext();
  const RESTAPIUri: string | undefined = process.env.REACT_APP_REST_API_URI;
  const [searchConversationInput, setSearchConversationInput] = useState<string>("");

  const [clickedConvParamsBtn, setClickedConvParamsBtn] = useState<string>("");

  const notificationSound = new Audio("notification.wav");

  const authApiToken = ApiToken();

  const fetchConversationLastMsg = async (conversationArr: ConversationType[]) => {
    //Disgusting code i gotta modify later
    const responseArr: ConversationType[] = [];
    for (let conversation of conversationArr) {
      try {
        const response = await fetch(
          RESTAPIUri +
            "/conversation/userId/" +
            user?._id +
            "/conversation/lastMessage?conversationId=" +
            conversation._id,
          {
            headers: {
              Authorization: `Bearer ${authApiToken}`,
            },
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        const jsonData = await response.json();
        if (jsonData) {
          let conversationObject = conversation;
          conversationObject.lastMessage = jsonData;
          conversationObject.lastMessage.date = new Date(conversationObject.lastMessage.date);
          responseArr.push(conversationObject);
        }
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
        return new Date(a.lastMessage.date).getTime() - new Date(b.lastMessage.date).getTime();
      })
      .reverse();
    return responseArr;
  };
  const fetchConversations = async (idsArray: string[]) => {
    console.log("Fetching conversations");
    const conversationsIdStr: string = idsArray.join("-");
    try {
      const response = await fetch(
        RESTAPIUri +
          "/conversation/userId/" +
          user?._id +
          "/getConversations?conversationsId=" +
          conversationsIdStr,
        {
          headers: {
            Authorization: `Bearer ${authApiToken}`,
          },
        }
      );
      if (!response.ok) {
        console.log("Error fetching conversations");
        const error = await response.json();
        throw new Error(error.message);
      }
      console.log("Conversations fetched");
      const jsonData = await response.json();
      console.log("CONVERSATIONS");
      console.log(jsonData);
      const test = await fetchConversationLastMsg(jsonData);
      setDisplayedConv(test[0]);
      setMostRecentConv(test[0]);
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
      const response = await fetch(RESTAPIUri + "/user/userConversationsId/userId/" + user?._id, {
        headers: {
          Authorization: `Bearer ${authApiToken}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
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
    if (conversation.lastMessage._id && user?._id && user?.userName) {
      setDisplayedConv(conversation);

      if (!conversation.lastMessage.seenBy.some((seenBy) => seenBy.username === user?.userName)) {
        updateSeenConversation(conversation.lastMessage._id, conversation);
      }
    }
  };
  const markMessagesAsSeen = async (messageId: string, userId: string, username: string) => {
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
        const error = await response.json();
        throw new Error(error.message);
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
  const updateSeenConversation = async (messageId: string, conversation: ConversationType) => {
    if (user) {
      const setMsgSeen = await markMessagesAsSeen(messageId, user._id, user.userName);
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

  const set5LatestConversation = (arrConversations: ConversationType[]): void => {
    let sortedConvArr = [...arrConversations].sort((a, b) => {
      return new Date(b.lastMessage.date).getTime() - new Date(a.lastMessage.date).getTime();
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

  const handleConvParamsClick = (e: React.MouseEvent, conversation: ConversationType) => {
    e.stopPropagation();
    console.log("ouiouioui" + conversation);
    setClickedConvParamsBtn((prev) => {
      if (prev === conversation._id) {
        return "";
      }
      return conversation._id;
    });
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
    if (!user) return null;
    //console.log(conversation.lastMessage);
    const isPrivateConv = !conversation.isGroupConversation;
    let partner;
    if (isPrivateConv) {
      partner = conversation.members.find((member) => member.userId !== user._id);
    }
    return (
      <div
        key={conversation._id + "-" + index}
        className="conversation"
        onClick={() => {
          handleConversationClick(conversation);
          console.log("ON CLICK CONV : ");
          console.log(conversation);
        }}
        id={conversation._id === displayedConv?._id ? "selected-conversation" : ""}
      >
        <div className="conversation-img-container">
          {isPrivateConv ? (
            <ProfilePic
              picSrc={partner?.photo}
              status={partner?.status}
              isOnline={partner?.isOnline}
              isGroupConversationPic={false}
            />
          ) : (
            <ProfilePic
              picSrc={conversation.customization.photo}
              status={undefined}
              isGroupConversationPic={true}
            />
          )}
        </div>
        <div className="conversation-text-container">
          <div className="conversation-name">
            {conversation.isGroupConversation
              ? conversation.customization.conversationName
                ? conversation.customization.conversationName
                : conversation.members
                    .filter((item) => item.username !== user?.userName)
                    .map((member) => getNickNameByUsername(conversation.members, member.username))
                    .join(", ")
              : conversation.members
                  .filter((item) => item.username !== user?.userName)
                  .map((member) => getNickNameByUsername(conversation.members, member.username))}
          </div>
          <div id="conversation-last-message">
            <div
              className="truncated-text"
              id={
                conversation.lastMessage.seenBy.some((seenBy) => seenBy.username === user?.userName)
                  ? "seen"
                  : "unseen-conversation"
              }
            >
              {
                //Kinda messy yeah
              }
              {conversation.lastMessage.author === "System/" + conversation._id ? (
                <ConvSystemMsg
                  textProps={
                    conversation.lastMessage.text[conversation.lastMessage.text.length - 1]
                  }
                  members={conversation.members}
                />
              ) : (
                getMessageText(
                  conversation._id,
                  user?.userName,
                  conversation.lastMessage.author,
                  conversation.lastMessage.text[conversation.lastMessage.text.length - 1]
                )
              )}
            </div>{" "}
            &nbsp;- {timeSince(conversation.lastMessage.date)} &nbsp;
            <div className="conversation-right-icons-container">
              {" "}
              {isConvMuted(user?.mutedConversations, conversation._id) && (
                <NotificationsOff height="1rem" width="1rem" color="#B0B3B8" />
              )}
              {!conversation.lastMessage.seenBy.some((seenBy) => seenBy.userId === user?._id) && (
                <div className="unseen-conversation-notification"></div>
              )}
            </div>
          </div>
          <div
            className="conversation-params"
            style={{
              display: clickedConvParamsBtn === conversation._id ? "block" : "none",
            }}
          >
            <div className="conversation-params-button">
              {" "}
              <EllipsisHorizontal
                onClick={(event: React.MouseEvent) => handleConvParamsClick(event, conversation)}
              />
            </div>
            {clickedConvParamsBtn === conversation._id && (
              <div className="conversation-params-menu-container">
                {" "}
                <div className="conversation-params-menu">
                  {" "}
                  <ConversationParams
                    conversation={conversation}
                    closeComponent={() => setClickedConvParamsBtn("")}
                  />
                </div>{" "}
              </div>
            )}
          </div>
        </div>
        <div className="conversation-msg-seen-by">
          <div className="seen-by">
            {conversation.lastMessage.authorId === user?._id && (
              <div className="seen-by-users">
                {conversation.lastMessage.seenBy
                  .filter((seenBy) => seenBy.userId !== user?._id)
                  .sort((a, b) => {
                    return new Date(b.seenDate).getTime() - new Date(a.seenDate).getTime();
                  })
                  .slice(0, 2)
                  .map((lastMsgSeen) => {
                    return (
                      <SeenByMember
                        conversation={conversation}
                        userId={lastMsgSeen.userId}
                        seenByDate={lastMsgSeen.seenDate}
                        width={"1.5rem"}
                        showUsernameTooltip={true}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const convFilterMember = (conversation: ConversationType) => {
    return conversation.members
      .map((member) => member.username)
      .join(",")
      .toLocaleLowerCase()
      .includes(searchConversationInput.toLowerCase());
  };
  const moreThanOneMinBetween = (date1: Date, date2: Date): boolean => {
    const differenceInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
    return differenceInMinutes > 1;
  };
  useEffect(() => {
    socket.on("message", (data) => {
      console.log("Message reçu");
      console.log(data[0]);
      const currentMsg = data[0];
      const conversation = data[1];
      setConversations((prev) => {
        return prev.map((conv) => {
          console.log("conv: " + conv._id + " currentMsg: " + currentMsg.conversationId);
          if (conv._id === currentMsg.conversationId) {
            console.log("CONVO ICI XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

            return { ...conv, lastMessage: { ...currentMsg, date: new Date(currentMsg.date) } };
          } else {
            console.log("là");
            return conv;
          }
        });
      });

      if (displayedConv?._id === currentMsg.conversationId) {
        // On new message, if the displayed conversation is the one with the new message, update the last message and mark it as seen
        updateSeenConversation(currentMsg._id, conversation);
      }
      setMostRecentConv(conversation);

      if (
        user?.status == "Busy" ||
        isConvMuted(user?.mutedConversations, currentMsg.conversationId)
      )
        return;

      console.log(user?.status);
      if (data[2]) {
        console.log(user?.status);
        const previousMsg = data[2];
        if (moreThanOneMinBetween(new Date(currentMsg.date), new Date(previousMsg.date))) {
          notificationSound.play();
        }
      } else {
        notificationSound.play();
      }
    });

    socket.on(
      "convUpdate",
      ({
        conversation,
        actionName,
        actionTargetId,
        actionValue,
      }: {
        conversation: ConversationType;
        actionName: string;
        actionTargetId: string;
        actionValue: string;
      }) => {
        if (!conversation || !conversation.lastMessage._id) return;
        if (conversation._id === displayedConv?._id) {
          console.log("MEMBERS CHANGE");
          updateSeenConversation(conversation.lastMessage._id, conversation);
          setDisplayedConv((prev) =>
            updateConv(prev, actionName, actionTargetId, actionValue, conversation)
          );
          setMostRecentConv((prev) => {
            return updateMostRecentConv(
              prev,
              conversations,
              conversation,
              actionName,
              actionTargetId,
              actionValue
            );
          });
        } else {
          setMostRecentConv((prev) => {
            return updateMostRecentConv(
              prev,
              conversations,
              conversation,
              actionName,
              actionTargetId,
              actionValue
            );
          });
        }
      }
    );

    socket.on(
      "addMembers",
      ({
        conversation,
        addedUsersArr,
      }: {
        conversation: ConversationType;
        addedUsersArr: ConversationMemberType[];
      }) => {
        console.log("ADD MEMBERS received");
        if (!conversation || !conversation.lastMessage._id) return;
        if (conversation._id === displayedConv?._id) {
          updateSeenConversation(conversation.lastMessage._id, conversation);
          setDisplayedConv((prev) => updateConvAddedMembers(prev, addedUsersArr, conversation));
          setMessages((prev) => [...prev, conversation.lastMessage]);
        }
        setMostRecentConv((prev) => {
          return updateMostRecentConvAddedMembers(conversations, prev, addedUsersArr, conversation);
        });
      }
    );

    socket.on(
      "removeMember",
      ({
        conversation,
        removedUsername,
      }: {
        conversation: ConversationType;
        removedUsername: string;
      }) => {
        console.log("REMOVED MEMBER LISTENED");
        if (!conversation || !conversation.lastMessage._id) return;
        if (conversation._id === displayedConv?._id) {
          console.log("IS DISPLAYEDCONV");
          updateSeenConversation(conversation.lastMessage._id, conversation);
          setDisplayedConv((prev) => updateConvRemovedMembers(prev, removedUsername, conversation));
          setMessages((prev) => [...prev, conversation.lastMessage]);
        }
        setMostRecentConv((prev) => {
          return updateMostRecentConvRemovedMembers(
            conversations,
            prev,
            removedUsername,
            conversation
          );
        });
      }
    );

    socket.on(
      "changeConvCustomization",
      ({
        conversation,
        customizationKey,
        customizationValue,
      }: {
        conversation: ConversationType;
        customizationKey: keyof CustomizationType;
        customizationValue: string;
      }) => {
        console.log("CHANGE CONV CUSTOMIZATION LISTENED");
        if (!conversation || !conversation.lastMessage._id) return;
        if (conversation._id === displayedConv?._id) {
          setDisplayedConv((prev) =>
            updateConvCustomization(prev, customizationKey, customizationValue, conversation)
          );
          setMessages((prev) => [...prev, conversation.lastMessage]);
        }
        setMostRecentConv((prev) => {
          return updateMostRecentConvCustomization(
            conversations,
            prev,
            customizationKey,
            customizationValue,
            conversation
          );
        });
      }
    );

    socket.on(
      "changeConvAdmin",
      ({
        conversation,
        targetUsername,
        changeAdmin,
      }: {
        conversation: ConversationType;
        targetUsername: string;
        changeAdmin: boolean;
      }) => {
        console.log("ADMIN CHANGE RECU");
        if (conversation._id === displayedConv?._id) {
          setDisplayedConv((prev) =>
            updateConvAdmin(prev, targetUsername, changeAdmin, conversation)
          );
        }

        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv._id === conversation._id) {
              return updateConvAdmin(conv, targetUsername, changeAdmin, conversation);
            }
            return conv;
          });
        });
      }
    );

    socket.on("changeStatus", (data) => {
      console.log("changesStatus", data);
      setConversations((prev) => {
        return prev.map((conv) => {
          const member = conv.members.find((member) => member.userId === data.userId);
          if (member) {
            member.status = data.status;
          }
          return conv;
        });
      });
    });

    socket.on("profilPicUpdate", ({ userId, picSrc }: { userId: string; picSrc: string }) => {
      console.log("profilPicUpdate", userId, picSrc);
      setConversations((prev) => {
        return prev.map((conv) => {
          const member = conv.members.find((member) => member.userId === userId);
          if (member) {
            member.photo = picSrc;
          }
          return conv;
        });
      });
    });

    socket.on(
      "isUserOnline",
      ({ userId, isOnline, lastSeen }: { userId: string; isOnline: boolean; lastSeen: Date }) => {
        console.log("isUserOnline listened");
        console.log(userId);
        setConversations((prev) => {
          return prev.map((conv) => {
            const member = conv.members.find((member) => member.userId === userId);

            if (member) {
              member.isOnline = isOnline;
              member.lastSeen = lastSeen;
              member.isTyping = false;
            }
            return conv;
          });
        });
      }
    );

    socket.on(
      "typing",
      ({
        isWriting,
        writingUser,
        conversation,
      }: {
        isWriting: boolean;
        writingUser: string;
        conversation: ConversationType;
      }) => {
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv._id === conversation._id)
              return {
                ...conv,
                members: conv.members.map((member) =>
                  member.username === writingUser ? { ...member, isTyping: isWriting } : member
                ),
              };
            return conv;
          });
        });
      }
    );
    return () => {
      socket.off("message");
      socket.off("convUpdate");
      socket.off("adminChange");
      socket.off("changeStatus");
      socket.off("isUserOnline");
      socket.off("typing");
      socket.off("removeMember");
      socket.off("addMembers");
      socket.off("changeConvCustomization");
      socket.off("changeConvAdmin");
    };
  }, [displayedConv?._id, user?.status]);

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
            <button onClick={() => console.log(user)}>
              <EllipsisHorizontal color={"#00000"} title="Paramètres" height="2rem" width="2rem" />
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
          <label htmlFor="search-conversations" className="search-conversations-label">
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
              <div id="search-input-cross" onClick={() => setSearchConversationInput("")}>
                <Close color={"#9B7575"} height="1.5rem" width="1.5rem" />
              </div>
            </div>
          )}
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
                  new Date(a.lastMessage.date).getTime() - new Date(b.lastMessage.date).getTime()
                );
              })
              .map((conversation, index) => conversationsMap(conversation, index))
          : conversations.map((conversation, index) => conversationsMap(conversation, index))}
      </div>
    </div>
  );
}

export default SideBarConversations;
