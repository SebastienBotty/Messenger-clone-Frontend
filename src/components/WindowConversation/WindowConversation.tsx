import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageType,
  Date15minDifference,
  UserDataType,
  ConversationType,
  LastMsgSeenByMembersType,
  MediasType,
  ConfirmationModalPropsType,
  QuotedMessageType,
  StatusType,
  CustomizationType,
} from "../../typescript/types";
import { Call, Videocam, InformationCircle, Close, ArrowDown } from "react-ionicons";
import { compareNowToDate } from "../../functions/time";
import "./WindowConversation.css";
import { useDisplayedConvContext } from "../../screens/userLoggedIn/userLoggedIn";
import {
  SelectedFoundMsgIdContext,
  ConversationFilesContext,
  ConversationMediasContext,
  useUserContext,
  useMessagesContext,
  useConversationsContext,
  MessagesRefContext,
  AddedMembersContext,
  HasMoreContext,
  useBlockedConvsContext,
} from "../../constants/context";
import TypingDots from "../Utiles/TypingDots/TypingdDots";
import _ from "lodash";
import { ApiToken } from "../../localStorage";
import { socket } from "../../Sockets/socket";

import AsyncMsg from "./AsyncMsg/AsyncMsg";
import ConversationDetails from "./ConversationDetails/ConversationDetails";
import ConvSystemMsg from "./ConvSystemMsg/ConvSystemMsg";
import { checkCacheFile } from "../../functions/cache";
import { calculateTotalSize, formatFileSize, getFileTypeFromPathName } from "../../functions/file";
import {
  updateConvLastMsgDelete,
  updateConvLastMsgEdited,
  updateDeletedMsg,
  updateMsgReactions,
  updateMsgText,
} from "../../functions/updateMessage";
import { getUsersSocket } from "../../api/user";
import ProfilePic from "../Utiles/ProfilePic/ProfilePic";
import { formatDateMsg, timeSince } from "../../functions/time";
import { statusTranslate } from "../../constants/status";
import MessagesOptions from "./MessagesOptions/MessagesOptions";
import MessageReactions from "./MessageReactions/MessageReactions";
import DisabledFooter from "./WindowConvFooter/DisabledFooter/DisabledFooter";
import NormalFooter from "./WindowConvFooter/NormalFooter/NormalFooter";
import CreateConvFooter from "./WindowConvFooter/CreateConvFooter/CreateConvFooter";
import EditingMsgFooter from "./WindowConvFooter/EditingMsgFooter/EditingMsgFooter";
import EditedMsgHistory from "../EditedMsgHistory/EditedMsgHistory";
import ConfirmationModal from "../Utiles/ConfirmationModal/ConfirmationModal";
import QuotedMessage from "./QuotedMessage/QuotedMessage";
import { getNickNameById, getNickNameByUsername } from "../../functions/StrFormatter";
import CreateConvHeader from "./WindowConvheader/CreateConvHeader/CreateConvHeader";
import NormalConvHeader from "./WindowConvheader/NormalConvHeader/NormalConvHeader";
import SeenByMember from "../Utiles/SeenByMember/SeenByMember";
import { getNewerMessages, getOlderMessages, getRecentMessages } from "../../api/message";
import BidirectionalInfiniteScroll from "./BidirectionalInfiniteScroll/BidirectionalInfiniteScroll";
import { getTextColor } from "../../functions/color";
import { isUserBlocked } from "../../functions/user";
import { isPrivateConvBlocked } from "../../functions/conversation";

function WindowConversation() {
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // Limite de 25 Mo en octets

  // Create conversation
  const [addedMembers, setAddedMembers] = useState<string[]>([]);

  // Displayed conversation
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setConversations } = useConversationsContext();
  const { blockedConversations, setBlockedConversations } = useBlockedConvsContext();
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [lastMsgSeenByConvMembers, setLastMsgSeenByConvMembers] = useState<
    LastMsgSeenByMembersType[]
  >([]);
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const [hasScroll, setHasScroll] = useState(false);

  const { user, setUser } = useUserContext();

  // POST Files handling
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showDragOverOverlay, setShowDragOverOverlay] = useState<boolean>(false);

  //Handling files view in conversationDetails
  const [mediasCtxt, setMediasCtxt] = useState<MediasType[]>([]);
  const [filesCtxt, setFilesCtxt] = useState<MediasType[]>([]);

  const { messages, setMessages } = useMessagesContext();
  const messagesRef = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  const [hasMoreOlder, setHasMoreOlder] = useState<boolean>(false);
  const [hasMoreNewer, setHasMoreNewer] = useState<boolean>(false);

  const [showConvDetails, setShowConvDetails] = useState<boolean>(false); //Displays conversation details

  //Edit Message
  const [selectedFoundMsgId, setSelectedFoundMsgId] = useState<string>(""); //Stocks the id of the message that was found by the search barµ
  const [editingMsg, setEditingMsg] = useState<MessageType | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationModalProps, setConfirmationModalProps] = useState<ConfirmationModalPropsType>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => {},
  });

  const [quotedMessage, setQuotedMessage] = useState<QuotedMessageType | null>(null);

  const [bodyHeight, setBodyHeight] = useState<string>("85%");
  const [footerHeight, setFooterHeight] = useState<string>("7.5%");

  const lastMessageIdRef = useRef("");

  const fetchRecentMessages = async () => {
    if (!displayedConv?._id || !user?._id) return;
    const response: MessageType[] = await getRecentMessages(displayedConv._id, user._id);

    if (response) {
      console.log("FETCG RECENT MESSAGE:" + hasMoreOlder);
      console.log(response);
      setMessages(response);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          top: scrollViewRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
      setTimeout(() => {
        setHasMoreOlder(true); // Put a timeout so it has the time to scroll down and not instantly trigger the fetchOlder msg
        setHasMoreNewer(false);
      }, 2000);

      return response;
    }
  };

  const fetchOlderMessages = async () => {
    if (!hasMoreOlder || !displayedConv?._id || !user?._id) return;
    console.log("FETCH OLDER Called HERE");
    setHasMoreOlder(false);

    try {
      const oldestMsgId = messages[0]?._id;
      if (!oldestMsgId) return;
      const response = await getOlderMessages(oldestMsgId, displayedConv._id, user._id);

      if (response) {
        if (response.length === 0) {
          return;
        }
        setMessages((prev) => [...response, ...prev]);
        setTimeout(() => {
          setHasMoreOlder(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages plus anciens:", error);
      setHasMoreOlder(false);
    }
  };

  const fetchNewerMessages = async () => {
    if (!hasMoreNewer || !displayedConv?._id || !user?._id) return;
    console.log("FETCH NEWER MESSAGES HERES");

    try {
      const newestMsgId = messages[messages.length - 1]?._id;
      if (!newestMsgId) return;
      setHasMoreNewer(false);

      const response = await getNewerMessages(newestMsgId, displayedConv._id, user._id);

      if (response) {
        if (response.length === 0) {
          return;
        }
        setMessages((prev) => [...prev, ...response]);

        if (response[response.length - 1]._id === displayedConv.lastMessage._id) {
          console.log("FETCHED LAST NEWER MSG = CONV LAST MSG");
          return;
        }
        setHasMoreNewer(true);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages plus récents:", error);
      setHasMoreNewer(false);
    }
  };

  useEffect(() => {
    console.log("newer");
    console.log(hasMoreNewer);

    return () => {};
  }, [hasMoreNewer]);

  useEffect(() => {
    console.log("older");
    console.log(hasMoreOlder);

    return () => {};
  }, [hasMoreOlder]);

  /**
   * Returns an array of the last messages seen by each member in the conversation (only the X first messages fetched on loading component)
   * excluding the current user. If a member has not seen any messages, it fetches
   * the last message they have seen in the DB. The function takes an array of MessageType objects
   * as input and updates the state with the last messages seen by each member.
   *
   * @param {MessageType[]} messagesArr - An array of MessageType objects representing
   * the messages in the conversation.
   * @return {boolean} This function always returns false.
   */
  const lastMsgSeenByMembers = async (messagesArr: MessageType[]) => {
    console.log("lastMsgSeenByMembers");
    const tempArray: LastMsgSeenByMembersType[] = [];
    if (displayedConv) {
      /* console.log("displayedConv");
      console.log(displayedConv.members); */
      for (const member of displayedConv.members) {
        /*         console.log("member" + member.username);
         */ if (member.username !== user?.userName) {
          for (const msg of messagesArr.reverse()) {
            if (msg.seenBy.some((seenBy) => seenBy.username === member.username)) {
              /*               console.log("PUSHED FOR" + member.username + " " + msg._id);
               */ const seenByDate = msg.seenBy.find(
                (seenBy) => seenBy.username === member.username
              )?.seenDate;

              tempArray.push({
                username: member.username,
                messageId: msg._id,
                userId: member.userId,
                seenByDate: seenByDate ? seenByDate : new Date(),
              });
              break; //Stop after finding the first msg he has seen(the latest one)
            }
          }
          //if no msg has been seen by this member, fetches the last message he has seen

          if (tempArray.every((item) => item.username !== member.username)) {
            //console.log("PLUS DE 15 MESSAGES POUR " + member.username);
            const lastMsgIdSeenByUser = await fetchLastMsgIdSeenByUser(member.username);
            if (!lastMsgIdSeenByUser) {
              //console.log("VU AUCUN MSG POUR " + member.username);
              tempArray.push({
                username: member.username,
                messageId: undefined,
                userId: member.userId,
                seenByDate: new Date(),
              });
              continue;
            }
            tempArray.push({
              username: member.username,
              messageId: lastMsgIdSeenByUser,
              userId: member.userId,
              seenByDate: new Date(),
            });
            //console.log("PUSHED LAST MSG  FETCH POUR " + member.username);
          }
        }
      }
      //console.log("tempArray set", tempArray);
      setLastMsgSeenByConvMembers(tempArray);
      return false;
    }
  };
  const fetchLastMsgIdSeenByUser = async (username: string) => {
    try {
      const response = await fetch(
        RESTAPIUri +
          "/message/userId/" +
          user?._id +
          "/getLastMsgSeenByUser?conversationId=" +
          displayedConv?._id +
          "&username=" +
          username,
        {
          headers: { authorization: `Bearer ${ApiToken()}` },
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lor du fetch lastMsgSeen");
      }
      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const isMoreThan15Minutes = (
    currentDateToForm: Date,
    previousDateToForm: Date
  ): Date15minDifference => {
    const currentDate = new Date(currentDateToForm);
    const previousDate = new Date(previousDateToForm);
    const differenceInMilliseconds = Math.abs(previousDate.getTime() - currentDate.getTime());
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000;
    const isMoreThan15Minutes = differenceInMilliseconds > fifteenMinutesInMilliseconds;

    let hours: string = String(
      currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours()
    );

    let minutes: string = String(
      currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes()
    );

    return {
      isMoreThan15Minutes,
      hours,
      minutes,
      date: currentDate,
    };
  };

  /* const isScrollAtTop = () => {
    if (scrollViewRef.current && scrollViewRef.current.scrollTop === 0) {
      fetchMessages();
    }
  }; */

  const checkPreviousMsgTime = (index: number): Date15minDifference => {
    const currMsgTime = messages[index].date;
    const prevMsgTime = messages[index - 1].date;
    return isMoreThan15Minutes(currMsgTime, prevMsgTime);
  };

  const emitSeenMsgToSocket = async (
    messageData: MessageType,
    conversation: ConversationType | null
  ) => {
    if (!user) return;
    console.log("messageData");
    console.log(messageData);
    const isMsgSeen = messageData.seenBy.some((seenBy) => seenBy.username === user.userName);
    if (isMsgSeen) {
      /*  console.log("message already seen");
      console.log(messageData.seenBy);
      console.log(messageData.text[messageData.text.length - 1]);
      console.log(messageData.author); */
      return;
    }
    const convMembersSocket = await getUsersSocket(conversation, user);
    const seenMsgData = messageData;
    messageData.seenBy.push({ username: user.userName, userId: user._id, seenDate: new Date() });
    const socketData = [convMembersSocket, seenMsgData, conversation, user._id];
    socket.emit("seenMessage", socketData);
    console.log("SEEN MESSAGE EMIT");
  };

  /* useEffect(() => {
    const div = scrollViewRef.current;
    console.log(div?.scrollTop);
    console.log(div?.scrollHeight);
    if (div) {
      scrollViewRef.current?.scrollTo({
        top: div.scrollHeight,
        behavior: "auto",
      });
      console.log("new div ", div.scrollTop);
      div?.addEventListener("scroll", isScrollAtTop);
    }

    return () => {
      div?.removeEventListener("scroll", isScrollAtTop);
    };
  }, []); */

  const displayMembersTyping = () => {
    if (!displayedConv || !user) return;

    const typingMembers = displayedConv.members.filter(
      (member) => member.isTyping && !isUserBlocked(member.userId, user?.blockedUsers)
    );
    if (typingMembers.length === 0) return;
    if (typingMembers.length > 2) {
      return (
        <>
          <TypingDots />
          <SeenByMember
            conversation={displayedConv}
            userId={typingMembers[0].userId}
            seenByDate={typingMembers[0].lastSeen} //This date has no use to be there, just have to put one but it won't be used
            width="1.5rem"
            showSeenByTooltip={false}
            showUsernameTooltip={true}
          />
          <SeenByMember
            conversation={displayedConv}
            userId={typingMembers[1].userId}
            seenByDate={typingMembers[1].lastSeen}
            width="1.5rem"
            showSeenByTooltip={false}
            showUsernameTooltip={true}
          />
          et{" "}
          {typingMembers.length - 2 > 1 ? typingMembers.length - 2 + " autres... " : " un autre..."}
        </>
      );
    } else {
      return (
        <>
          <TypingDots />
          {typingMembers.map((member) => (
            <SeenByMember
              conversation={displayedConv}
              userId={member.userId}
              seenByDate={member.lastSeen}
              width={"1.5rem"}
              showSeenByTooltip={false}
              showUsernameTooltip={true}
            />
          ))}
        </>
      );
    }
  };

  const asyncFetchMsg = async () => {
    const fetchedMessages = await fetchRecentMessages();
    if (!fetchedMessages || fetchedMessages.length === 0) return;

    lastMsgSeenByMembers(fetchedMessages);
    emitSeenMsgToSocket(fetchedMessages[0], displayedConv);
  };

  const handleMouseEnter = (id: string | undefined) => {
    console.log("ICI");
    console.log(id);
    if (!id) return;
    const timer = setTimeout(() => {
      setHoveredId(id);
    }, 250);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }
    setHoveredId(null);
  };

  const handleTextAreaResize = (newTextareaHeight: number, reset?: string) => {
    if (reset === "reset") {
      setFooterHeight("7.5vh");
      setBodyHeight("85vh");
    } else {
      // Ajuster la hauteur du corps en conséquence pour maintenir la hauteur totale constante
      setBodyHeight(`${92.5 - newTextareaHeight}vh`);
      setFooterHeight(`${newTextareaHeight}vh`);
    }
    scrollViewRef?.current?.scrollTo({
      top: scrollViewRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Fonction pour vérifier si le dernier message affiché correspond au dernier message de la conversation
  const isLastMessageVisible = () => {
    const lastVisibleMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const lastConvMsgId = lastMessageIdRef.current;
    console.log("Last visible message:", lastVisibleMessage?._id);
    console.log("LASTMESSAGE:" + lastConvMsgId);

    // Si nous sommes au bas de la conversation ou si c'est le premier message
    if (!lastVisibleMessage || lastVisibleMessage._id === lastConvMsgId) {
      console.log("CEST OK");
      setHasMoreNewer(false);
      return true;
    } else {
      console.log("c'est pas ok");
      setHasMoreNewer(true);
      return false;
    }
  };

  useEffect(() => {
    if (!displayedConv) return;
    setDroppedFiles([]);
    setMessages([]);
    setEditingMsg(null);
    setSelectedFoundMsgId("");
    setQuotedMessage(null);
    setHasMoreNewer(false);
    setHasMoreOlder(false);

    /*   console.log("MESSSSSSSAGE RESET");
      console.log(displayedConv._id); */
    asyncFetchMsg();
  }, [displayedConv?._id]);
  useEffect(() => {
    if (displayedConv) {
      // Utiliser une fonction de référence pour accéder aux valeurs les plus récentes
      const messageHandler = (data: any) => {
        if (!displayedConv || !user) return;
        const message: MessageType = data[0];
        const convId = data[1]._id;
        /*  console.log("MESSAGE RECU");
console.log(message);
console.log("DISPLAYED CONV DEBUT" + displayedConv.lastMessage._id); */
        if (convId === displayedConv?._id) {
          // Utiliser une fonction pour obtenir l'état le plus récent
          // Accéder aux valeurs actuelles via une fonction de rappel
          setMessages((currentMessages) => {
            // Vérifier si le dernier message visible est le dernier message de la conversation
            const lastVisibleMessage =
              currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
            const lastConvMsgId = lastMessageIdRef.current;
            /* console.log("Last visible message:", lastVisibleMessage?._id);
  console.log("LASTMESSAGE:" + lastConvMsgId); */

            // Si nous sommes au bas de la conversation ou si c'est le premier message
            if (!lastVisibleMessage || lastVisibleMessage._id === lastConvMsgId) {
              console.log("LE DERNIER MESSAGE EST LE DERNIER MESSAGE VISIBLE");

              if (!isPrivateConvBlocked(displayedConv._id, blockedConversations)) {
                console.log("personné non bloquée donc  emit seen");
                emitSeenMsgToSocket(message, displayedConv);
              }
              setLastMsgSeenByConvMembers((prev) =>
                prev.map((item) =>
                  item.username === message.seenBy[0].username
                    ? { ...item, messageId: message._id }
                    : item
                )
              );
              if (isAtBottom) {
                setTimeout(() => {
                  scrollViewRef?.current?.scrollTo({
                    top: scrollViewRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                  console.log("scrolling to bottom");
                }, 100);
              }
              return [...currentMessages, message];
            } else {
              console.log("LE DERNIER MESSAGE N'EST PAS LE DERNIER MESSAGE VISIBLE");
              return currentMessages;
            }
          });

          setDisplayedConv((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              lastMessage: message,
            };
          });
        }
      };

      socket.on("message", (data) => messageHandler(data));

      socket.on(
        "seenMessage",
        ({
          message,
          conversation,
          userId,
        }: {
          message: MessageType;
          conversation: ConversationType;
          userId: string;
        }) => {
          console.log("SEEN MESSAGE RECU");
          console.log(userId);

          if (conversation._id === displayedConv?._id) {
            setLastMsgSeenByConvMembers((prev) =>
              prev.map((item) => {
                if (item.userId === userId) {
                  console.log("ici");
                  console.log(item);
                  return {
                    ...item,
                    messageId: message._id,
                  };
                } else {
                  return item;
                }
              })
            );
            /*  setMessages((prev) => prev.map((msg)=>{
            msg._id === message._id?
          })); */
          }
          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === conversation._id ? { ...conv, lastMessage: message } : conv
            )
          );
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
          if (conversation._id === displayedConv?._id) {
            if (isWriting === true) {
              setDisplayedConv((prev) => {
                if (prev) {
                  return {
                    ...prev,
                    members: prev.members.map((member) =>
                      member.username === writingUser ? { ...member, isTyping: true } : member
                    ),
                  };
                }
                return prev;
              });
            } else {
              setDisplayedConv((prev) => {
                if (prev) {
                  return {
                    ...prev,
                    members: prev.members.map((member) =>
                      member.username === writingUser ? { ...member, isTyping: false } : member
                    ),
                  };
                }
                return prev;
              });
            }
          }
        }
      );

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
          console.log("members change écouté");
          if (conversation._id === displayedConv?._id) {
            console.log("c les meme");
            setMessages((prev) => [...prev, conversation.lastMessage]);
            if (!isPrivateConvBlocked(displayedConv._id, blockedConversations)) {
              emitSeenMsgToSocket(conversation.lastMessage, displayedConv);
            }
            setLastMsgSeenByConvMembers((prev) =>
              prev.map((item) =>
                item.username === conversation.lastMessage?.seenBy[0].username
                  ? { ...item, messageId: conversation.lastMessage._id }
                  : item
              )
            );
          }
        }
      );
      socket.on("newFile", (data) => {
        const fileData: MediasType = data[0];
        const conversationId: string = data[1];
        console.log(data);

        let cacheKey: string = "";
        if (checkCacheFile(fileData, conversationId)) {
          if (getFileTypeFromPathName(fileData.Key) === "Files") {
            cacheKey = `filesCache_${conversationId}`;
          } else {
            cacheKey = `mediasCache_${conversationId}`;
          }
          console.log(cacheKey);
          const cacheArr = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");
          cacheArr.unshift(fileData);
          sessionStorage.setItem(cacheKey, JSON.stringify(cacheArr));

          if (getFileTypeFromPathName(fileData.Key) === "Files") {
            console.log("files");
            setFilesCtxt(cacheArr);
          } else {
            console.log("medias");
            setMediasCtxt(cacheArr);
          }
        }
      });

      socket.on("deletedMessage", (data) => {
        const msg: MessageType = data[0];
        const conversationId: string = data[1];
        console.log(msg, conversationId);
        if (conversationId === displayedConv?._id) {
          console.log("SOCKET ON OKLM");

          updateDeletedMsg(msg, setMessages);
        }
        updateConvLastMsgDelete(msg, setConversations);
      });

      socket.on("changeReaction", (data) => {
        const reactionsArr = data[0];
        const messageId = data[1];
        const conversationId = data[2];
        if (conversationId === displayedConv?._id) {
          updateMsgReactions(messageId, reactionsArr, setMessages);
        }
      });

      socket.on("editedMessage", (message: MessageType) => {
        console.log("received edit msg in windowConv");
        console.log(message);

        if (!message._id) return;
        if (message.conversationId === displayedConv?._id) {
          console.log("c'est égal");
          updateMsgText(message._id, message.text[message.text.length - 1], setMessages);
        }
        updateConvLastMsgEdited(message, setConversations);
      });

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
            if (!isPrivateConvBlocked(displayedConv._id, blockedConversations)) {
              console.log("personné non bloquée donc pas emit seen");
              emitSeenMsgToSocket(conversation.lastMessage, displayedConv);
            }
            setLastMsgSeenByConvMembers((prev) =>
              prev.map((item) =>
                item.username === conversation.lastMessage?.seenBy[0].username
                  ? { ...item, messageId: conversation.lastMessage._id }
                  : item
              )
            );
          }
        }
      );
    }

    return () => {
      socket.off("message");
      socket.off("seenMessage");
      socket.off("typing");
      socket.off("convUpdate");
      socket.off("newFile");
      socket.off("deletedMessage");
      socket.off("changeReaction");
      socket.off("editedMessage");
      socket.off("changeConvCustomization");
    };
  }, [displayedConv?._id, blockedConversations]);

  useEffect(() => {
    console.log("ICI USEFFECT");
    if (isAtBottom && messagesEndRef.current) {
      console.log("SCROLL TO BOTTOM");
      messagesEndRef.current.scrollIntoView();
    }

    messages.forEach((message) => {
      if (!message._id) return;
      if (!messagesRef.current[message._id]) {
        messagesRef.current[message._id] = React.createRef<HTMLDivElement>();
      }
    });

    return () => {};
  }, [messages.length, displayedConv?._id]);

  /* Scroll Management --------------------------------------------------------------------------------------------
    Check if the scroll height is greater than the client height and update the hasScroll state
  */
  /*  useEffect(() => {
    const checkScroll = () => {
      if (scrollViewRef.current) {
        setHasScroll(scrollViewRef.current.scrollHeight > scrollViewRef.current.clientHeight);
        /*  console.log("CHEKC ICI");
        console.log(scrollViewRef.current.scrollHeight > scrollViewRef.current.clientHeight); 
      }
    };

    checkScroll();

    const observer = new MutationObserver(checkScroll);
    if (scrollViewRef.current) {
      observer.observe(scrollViewRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []); */

  // Files Management ----------------------------------------------------------------------------------------------
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!showDragOverOverlay) {
      setShowDragOverOverlay(true);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const { files } = event.dataTransfer;
      if (files) {
        const newFiles = Array.from(files);
        checkFiles(newFiles);
      }
    },
    [droppedFiles]
  );

  const checkFiles = (files: File[]) => {
    const badFileNames: string[] = [];
    const alreadyDroppedFiles: string[] = [];
    for (const file of files) {
      if (file.name.includes(",") || file.name.includes("-")) {
        badFileNames.push(file.name);
        setShowDragOverOverlay(false);
        continue;
      }

      if (droppedFiles.some((f) => f.name === file.name)) {
        setShowDragOverOverlay(false);
        alreadyDroppedFiles.push(file.name);
        continue;
      }

      const totalSize = calculateTotalSize([...droppedFiles, file]);
      //console.log(totalSize);
      //console.log(MAX_FILE_SIZE_BYTES);

      if (totalSize <= MAX_FILE_SIZE_BYTES) {
        setDroppedFiles((prevFiles) => [...prevFiles, file]);
        setShowDragOverOverlay(false);
      } else {
        alert(
          "Le poids total des fichiers excède la limite de " +
            MAX_FILE_SIZE_BYTES / 1024 / 1024 +
            " Mo.\n Poids actuel : " +
            formatFileSize(totalSize) +
            ".\n " +
            file.name +
            " : " +
            formatFileSize(file.size)
        );
        setShowDragOverOverlay(false);
      }
    }
    if (inputFileRef.current) {
      inputFileRef.current.value = ""; // Reset le champ de saisi
    }
    if (badFileNames.length > 0) {
      alert(
        "Veuillez ne pas utiliser de virgule ni de tiret dans le nom du fichier: \n " +
          badFileNames.join("\n")
      );
    }
    if (alreadyDroppedFiles.length > 0) {
      alert(
        "Le(s) fichier(s) suivant(s) est(sont) déjà dans la liste: \n " +
          alreadyDroppedFiles.join("\n")
      );
    }
  };

  const handleModifiedMsgClick = (message: MessageType) => {
    setConfirmationModalProps({
      title: "Historique du message",
      text: <EditedMsgHistory message={message} />,
      action: () => {},
      closeModal: () => setShowConfirmationModal(false),
    });
    setShowConfirmationModal(true);
  };
  const renderWindowConvFooter = () => {
    if (displayedConv === null) return <CreateConvFooter />;
    else if (editingMsg !== null)
      return (
        <EditingMsgFooter
          message={editingMsg}
          setEditingMsg={setEditingMsg}
          onTextAreaResize={handleTextAreaResize}
          height={footerHeight}
        />
      );
    else if (
      user &&
      displayedConv.members &&
      displayedConv.members.some((member) => member.username === user.userName) &&
      !blockedConversations.some((conv) => conv._id === displayedConv._id)
    ) {
      return (
        <NormalFooter
          setShowDragOverOverlay={setShowDragOverOverlay}
          droppedFiles={droppedFiles}
          setDroppedFiles={setDroppedFiles}
          onTextAreaResize={handleTextAreaResize}
          height={footerHeight}
          quotedMessage={quotedMessage}
          setQuotedMessage={setQuotedMessage}
        />
      );
    } else return <DisabledFooter />;
  };

  useEffect(() => {
    if (editingMsg || quotedMessage) handleTextAreaResize(15);
    else handleTextAreaResize(15, "reset");
    return () => {};
  }, [editingMsg, quotedMessage]);

  useEffect(() => {
    if (displayedConv?.lastMessage?._id) {
      lastMessageIdRef.current = displayedConv.lastMessage._id;
    }
  }, [displayedConv?.lastMessage?._id]);

  function goToBottom(): void {
    if (isLastMessageVisible()) {
      console.log("scrolling to bottom");
      scrollViewRef.current?.scrollTo({
        top: scrollViewRef.current.scrollHeight,
      });
    } else {
      console.log("fetchRecentMessages");
      fetchRecentMessages();
    }
  }

  /* useEffect(() => {
    if (displayedConv && displayedConv.lastMessage) {
      const lastMessageInState = messages[messages.length - 1];
      if (lastMessageInState && displayedConv.lastMessage._id !== lastMessageInState._id) {
        setHasMoreNewer(true);
      }
    }
  }, [displayedConv?.lastMessage?._id]); */

  // Fonction de gestion du défilement personnalisée
  const handleCustomScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Vérifier si l'utilisateur est au bas de la conversation
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;
    setIsAtBottom(isAtBottom);

    setHasScroll(scrollHeight > clientHeight);
  };

  return (
    <AddedMembersContext.Provider value={{ addedMembers, setAddedMembers }}>
      <SelectedFoundMsgIdContext.Provider value={{ selectedFoundMsgId, setSelectedFoundMsgId }}>
        <MessagesRefContext.Provider value={{ messagesRef }}>
          <HasMoreContext.Provider
            value={{ hasMoreOlder, setHasMoreOlder, hasMoreNewer, setHasMoreNewer }}
          >
            <div className="WindowConversation" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className={`conversation-container ${showConvDetails ? "retracted" : ""}`}>
                {showDragOverOverlay &&
                  displayedConv?._id &&
                  !isPrivateConvBlocked(displayedConv._id, blockedConversations) && (
                    <div className="drag-overlay">
                      <span>Déposer un fichier</span>{" "}
                    </div>
                  )}
                <div className="conversation-header">
                  <div className="conversation-member-info">
                    {displayedConv ? (
                      <NormalConvHeader setShowConvDetails={setShowConvDetails} />
                    ) : (
                      <CreateConvHeader setShowConvDetails={setShowConvDetails} />
                    )}
                  </div>
                </div>
                <div
                  className="conversation-body"
                  style={{
                    height: bodyHeight,
                    transition: "height 0.1s ease",
                  }}
                >
                  <BidirectionalInfiniteScroll
                    dataLength={messages.length}
                    fetchOlder={fetchOlderMessages}
                    fetchNewer={fetchNewerMessages}
                    hasMoreOlder={hasMoreOlder}
                    hasMoreNewer={hasMoreNewer}
                    height="100%"
                    scrollableTarget="conversation-scroll"
                    className="conversation-messages"
                    loaderOlder={
                      <div className="loading-indicator">
                        Chargement des messages plus anciens...
                      </div>
                    }
                    loaderNewer={
                      <div className="loading-indicator">
                        Chargement des messages plus récents...
                      </div>
                    }
                    endMessageOlder={<div className="end-message">Début de la conversation</div>}
                    endMessageNewer={<div className="end-message">Vous êtes à jour</div>}
                    onScroll={handleCustomScroll}
                    scrollRef={scrollViewRef}
                  >
                    {editingMsg && (
                      <div className="editingMsgOverlay" onClick={() => setEditingMsg(null)}>
                        {" "}
                      </div>
                    )}
                    {displayedConv && (
                      <>
                        {/* <div className="load-more-messages">
                        <span onClick={() => fetchOlderMessages()}>Charger plus de message</span>
                      </div> */}
                        {(!isAtBottom && hasScroll) ||
                          (hasMoreNewer && (
                            <div className="button-go-to-last-message">
                              <button onClick={() => goToBottom()}>
                                <ArrowDown
                                  color={"#00000"}
                                  title="Défiler tout en bas"
                                  height="3vh"
                                  width="3vh"
                                />
                              </button>
                            </div>
                          ))}
                      </>
                    )}
                    {messages
                      .sort((a, b) => {
                        return new Date(a.date).getTime() - new Date(b.date).getTime();
                      })
                      .map((message, index) => {
                        if (!message._id || !user?._id) return null;
                        const userBlocked = isUserBlocked(
                          message.authorId,
                          user.blockedUsers,
                          new Date(message.date)
                        );

                        if (userBlocked) return null;
                        const isMsgDeletedByUser =
                          message?.deletedBy &&
                          message.deletedBy.some((deletedBy) => deletedBy.userId === user?._id);
                        if (isMsgDeletedByUser) return null;

                        let checkMsgTime: Date15minDifference = {
                          isMoreThan15Minutes: false,
                          hours: "0",
                          minutes: "0",
                          date: new Date(),
                        };
                        if (index > 0) {
                          checkMsgTime = checkPreviousMsgTime(index);
                        }
                        const firstMessage = index === 0;
                        const lastMessage = index === messages.length - 1;
                        const currentMsg = index;
                        const isgMsgEdit = message.text.length > 1;
                        if (message.author === "System/" + displayedConv?._id) {
                          return (
                            <>
                              <div
                                className="message-container"
                                id="message-system"
                                onClick={() => console.log(message)}
                                onMouseEnter={() => handleMouseEnter(message._id)}
                                onMouseLeave={handleMouseLeave}
                                style={{ position: "relative" }}
                              >
                                <ConvSystemMsg
                                  textProps={message.text[message.text.length - 1]}
                                  members={displayedConv?.members}
                                />
                                {hoveredId === message._id && (
                                  <div className="msg-date">
                                    <div className="sent-date">
                                      {formatDateMsg(new Date(message.date))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {lastMsgSeenByConvMembers.some(
                                (member) => member.messageId === message._id
                              ) && (
                                <div className="seen-by ">
                                  {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                                    if (displayedConv && message._id === lastMsgSeen.messageId) {
                                      return (
                                        <SeenByMember
                                          conversation={displayedConv}
                                          userId={lastMsgSeen.userId}
                                          seenByDate={lastMsgSeen.seenByDate}
                                          width={"1.5rem"}
                                          showSeenByTooltip={true}
                                        />
                                      );
                                    }
                                  })}
                                </div>
                              )}
                            </>
                          );
                        }
                        if (message?.author === user?.userName) {
                          return (
                            <div
                              key={message.author + "-" + index}
                              onClick={() => {
                                if (!message._id) return;
                                console.log(message);
                                console.log(lastMsgSeenByConvMembers);
                              }}
                              ref={
                                firstMessage ? firstMessageRef : messagesRef.current[message._id]
                              }
                            >
                              {checkMsgTime.isMoreThan15Minutes && (
                                <div className="message-container" id="Time-center-display">
                                  {compareNowToDate(checkMsgTime.date) ||
                                    checkMsgTime.hours + " : " + checkMsgTime.minutes}
                                </div>
                              )}
                              {isgMsgEdit && (
                                <div className="message-author-name message-author-name-me">
                                  <div
                                    className="edited-msg "
                                    onClick={() => handleModifiedMsgClick(message)}
                                  >
                                    Modifié
                                  </div>{" "}
                                </div>
                              )}
                              {message.responseToMsgId &&
                                !message.responseToMsgId.deletedBy?.some(
                                  (deletedBy) => deletedBy.userId === user?._id
                                ) && (
                                  <QuotedMessage
                                    quotedMessage={message.responseToMsgId}
                                    currentMsgAuthorId={message.authorId}
                                    currentMsgAuthor={message.author}
                                  />
                                )}
                              <div
                                className="message-container"
                                id="message-me"
                                onClick={() => console.log(quotedMessage)}
                              >
                                <MessagesOptions
                                  message={message}
                                  setEditingMsg={setEditingMsg}
                                  editingMsg={editingMsg}
                                  setQuotedMessage={setQuotedMessage}
                                  quotedMessage={quotedMessage}
                                />

                                <div
                                  className={`message ${
                                    selectedFoundMsgId === message._id ? "selectedFoundMsg" : ""
                                  }`}
                                  ref={lastMessage ? messagesEndRef : null}
                                  onMouseEnter={() => handleMouseEnter(message._id)}
                                  onMouseLeave={handleMouseLeave}
                                  style={
                                    displayedConv
                                      ? {
                                          backgroundColor: displayedConv.customization.theme,
                                          color: getTextColor(displayedConv.customization.theme),
                                        }
                                      : {}
                                  }
                                >
                                  {hoveredId === message._id && (
                                    <div className="msg-date">
                                      <div className="sent-date">
                                        {message.deletedForEveryoneDate && "Envoyé: "}
                                        {formatDateMsg(new Date(message.date))}
                                      </div>
                                      {message.deletedForEveryoneDate && (
                                        <div className="delete-date">
                                          Retiré:{" "}
                                          {formatDateMsg(new Date(message.deletedForEveryoneDate))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <AsyncMsg message={message} />
                                  <MessageReactions message={message} />
                                </div>
                              </div>
                              {lastMsgSeenByConvMembers.some(
                                (member) => member.messageId === message._id
                              ) && (
                                <div className="seen-by">
                                  {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                                    if (displayedConv && message._id === lastMsgSeen.messageId) {
                                      return (
                                        <SeenByMember
                                          conversation={displayedConv}
                                          userId={lastMsgSeen.userId}
                                          seenByDate={lastMsgSeen.seenByDate}
                                          width={"1.5rem"}
                                          showSeenByTooltip={true}
                                        />
                                      );
                                    }
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (messages[currentMsg + 1]?.author === message?.author) {
                          return (
                            <div
                              key={message.author + "-" + index}
                              onClick={() => {
                                console.log(message);
                              }}
                              ref={
                                firstMessage ? firstMessageRef : messagesRef.current[message._id]
                              }
                            >
                              {checkMsgTime.isMoreThan15Minutes && (
                                <div className="message-container" id="Time-center-display">
                                  {" "}
                                  {compareNowToDate(checkMsgTime.date) ||
                                    checkMsgTime.hours + " : " + checkMsgTime.minutes}
                                </div>
                              )}

                              {messages[currentMsg]?.author !== messages[currentMsg - 1]?.author &&
                                displayedConv?.isGroupConversation && (
                                  <div className="message-author-name">
                                    <div className="message-author">
                                      {" "}
                                      {getNickNameById(displayedConv.members, message.authorId)}
                                    </div>
                                    {isgMsgEdit && (
                                      <div
                                        className="edited-msg"
                                        onClick={() => handleModifiedMsgClick(message)}
                                      >
                                        Modifié
                                      </div>
                                    )}
                                  </div>
                                )}
                              {message.responseToMsgId &&
                                !message.responseToMsgId.deletedBy?.some(
                                  (deletedBy) => deletedBy.userId === user?._id
                                ) && (
                                  <QuotedMessage
                                    quotedMessage={message.responseToMsgId}
                                    currentMsgAuthorId={message.authorId}
                                    currentMsgAuthor={message.author}
                                  />
                                )}
                              <div className="message-container" id="message-others">
                                <div className="img-container"> </div>
                                <div
                                  className={`message ${
                                    selectedFoundMsgId === message._id ? "selectedFoundMsg" : ""
                                  }`}
                                  ref={lastMessage ? messagesEndRef : null}
                                  onMouseEnter={() => handleMouseEnter(message._id)}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  {hoveredId === message._id && (
                                    <div className="msg-date">
                                      <div className="sent-date">
                                        {message.deletedForEveryoneDate && "Envoyé: "}
                                        {formatDateMsg(new Date(message.date))}
                                      </div>
                                      {message.deletedForEveryoneDate && (
                                        <div className="delete-date">
                                          Retiré:{" "}
                                          {formatDateMsg(new Date(message.deletedForEveryoneDate))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <AsyncMsg message={message} />
                                  <MessageReactions message={message} />
                                </div>
                                <MessagesOptions
                                  message={message}
                                  setEditingMsg={setEditingMsg}
                                  editingMsg={editingMsg}
                                  setQuotedMessage={setQuotedMessage}
                                  quotedMessage={quotedMessage}
                                />
                              </div>
                              {lastMsgSeenByConvMembers.some(
                                (member) => member.messageId === message._id
                              ) && (
                                <div className="seen-by">
                                  {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                                    if (message._id === lastMsgSeen.messageId) {
                                      return <div>{lastMsgSeen.username}</div>;
                                    }
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <div
                            key={message.author + "-" + index}
                            onClick={() => {
                              if (!message._id) return;
                              console.log(messagesRef.current[message._id]);
                            }}
                            ref={firstMessage ? firstMessageRef : messagesRef.current[message._id]}
                          >
                            {messages[currentMsg]?.author !== messages[currentMsg - 1]?.author &&
                              displayedConv?.isGroupConversation && (
                                <div className="message-author-name">
                                  <div className="message-author">
                                    {getNickNameById(displayedConv.members, message.authorId)}
                                  </div>
                                </div>
                              )}
                            {isgMsgEdit && (
                              <div className="message-author-name">
                                <div
                                  className="edited-msg"
                                  onClick={() => handleModifiedMsgClick(message)}
                                >
                                  Modifié
                                </div>
                              </div>
                            )}
                            {message.responseToMsgId &&
                              !message.responseToMsgId.deletedBy?.some(
                                (deletedBy) => deletedBy.userId === user?._id
                              ) && (
                                <QuotedMessage
                                  quotedMessage={message.responseToMsgId}
                                  currentMsgAuthorId={message.authorId}
                                  currentMsgAuthor={message.author}
                                />
                              )}
                            <div className="message-container" id="message-others">
                              {" "}
                              <div className="img-container">
                                <ProfilePic
                                  picSrc={
                                    displayedConv?.members.find(
                                      (member) => member.userId === message.authorId
                                    )?.photo
                                  }
                                  status={
                                    displayedConv?.members.find(
                                      (member) => member.userId === message.authorId
                                    )?.status
                                  }
                                  isGroupConversationPic={false}
                                  showStatus={false}
                                />
                              </div>
                              <div
                                className={`message ${
                                  selectedFoundMsgId === message._id ? "selectedFoundMsg" : ""
                                }`}
                                ref={lastMessage ? messagesEndRef : null}
                                onClick={() => console.log(message)}
                                onMouseEnter={() => handleMouseEnter(message._id)}
                                onMouseLeave={handleMouseLeave}
                              >
                                {hoveredId === message._id && (
                                  <div className="msg-date">
                                    <div className="sent-date">
                                      {message.deletedForEveryoneDate && "Envoyé: "}
                                      {formatDateMsg(new Date(message.date))}
                                    </div>
                                    {message.deletedForEveryoneDate && (
                                      <div className="delete-date">
                                        Retiré:{" "}
                                        {formatDateMsg(new Date(message.deletedForEveryoneDate))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                <AsyncMsg message={message} />
                                <MessageReactions message={message} />
                              </div>
                              <MessagesOptions
                                message={message}
                                setEditingMsg={setEditingMsg}
                                editingMsg={editingMsg}
                                setQuotedMessage={setQuotedMessage}
                                quotedMessage={quotedMessage}
                              />
                            </div>
                            {lastMsgSeenByConvMembers.some(
                              (member) => member.messageId === message._id
                            ) && (
                              <div className="seen-by">
                                {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                                  if (displayedConv && message._id === lastMsgSeen.messageId) {
                                    return (
                                      <SeenByMember
                                        conversation={displayedConv}
                                        userId={lastMsgSeen.userId}
                                        seenByDate={lastMsgSeen.seenByDate}
                                        width={"1.5rem"}
                                        showSeenByTooltip={true}
                                      />
                                    );
                                  }
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                    <div className="conversation-body-bottom" style={{ display: "flex" }}>
                      {displayedConv?.members.some((member) => member.isTyping) && (
                        <div className="typing-users">{displayMembersTyping()}</div>
                      )}{" "}
                    </div>
                  </BidirectionalInfiniteScroll>
                </div>

                <div
                  className="conversation-footer"
                  style={{
                    height: footerHeight,
                    transition: "height 0.1s ease",
                  }}
                >
                  {renderWindowConvFooter()}
                </div>
              </div>
              <div className={`conversation-details ${showConvDetails ? "expanded" : ""}`}>
                {showConvDetails && (
                  <ConversationMediasContext.Provider value={{ mediasCtxt, setMediasCtxt }}>
                    <ConversationFilesContext.Provider value={{ filesCtxt, setFilesCtxt }}>
                      <ConversationDetails />
                    </ConversationFilesContext.Provider>
                  </ConversationMediasContext.Provider>
                )}
              </div>
              {showConfirmationModal && <ConfirmationModal {...confirmationModalProps} />}
            </div>
          </HasMoreContext.Provider>
        </MessagesRefContext.Provider>
      </SelectedFoundMsgIdContext.Provider>
    </AddedMembersContext.Provider>
  );
}

export default WindowConversation;
