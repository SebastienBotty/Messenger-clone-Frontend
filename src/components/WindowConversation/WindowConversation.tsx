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

function WindowConversation() {
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // Limite de 25 Mo en octets

  // Create conversation
  const [addedMembers, setAddedMembers] = useState<string[]>([]);
  const [searchUserInput, setSearchUserInput] = useState<string>("");
  const [usersPrediction, setUsersPrediction] = useState<UserDataType[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Displayed conversation
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setConversations } = useConversationsContext();
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [convMembersTyping, setConvMembersTyping] = useState<string[]>([]);
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

  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";
  const fetchMsgIndex = useRef(0);
  const limitFetchMsg: number = 20;
  const { messages, setMessages } = useMessagesContext();
  const messagesRef = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

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

  const fetchMessages = async (): Promise<MessageType[] | false> => {
    const response = await fetch(
      RESTAPIUri +
        "/message/userId/" +
        user?._id +
        "/getMessages?conversationId=" +
        displayedConv?._id +
        "&start=" +
        fetchMsgIndex.current +
        "&limit=" +
        limitFetchMsg,
      {
        headers: { authorization: `Bearer ${ApiToken()}` },
      }
    );
    console.log(fetchMsgIndex.current);
    try {
      if (!response.ok) {
        const jsonData = await response.json();
        throw new Error(jsonData.message);
      }
      const jsonData: MessageType[] = await response.json();
      //console.log("iciiiiiiiiiiiiiiiiiiiiii");
      //console.log(messages, jsonData);
      let messageTemp: MessageType[] = [];
      if (fetchMsgIndex.current > 0) messageTemp = messages;
      setMessages([]); //Again, had to to clear messages before adding new ones??? Probably an asynch shit or smt like that.
      setTimeout(() => {
        setMessages([...messageTemp, ...jsonData]);
      }, 1);
      if (jsonData.length > 0) {
        fetchMsgIndex.current += jsonData.length;
      }
      if (firstMessageRef.current) {
        firstMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }

      /*  jsonData.filter((msg: MessageType) => {
        if (msg.text === "Ideein-removeUser-Alex") {
          console.log("ici");
          console.log(jsonData);
        }
      }); */
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

  /**
   * Returns an array of the last messages seen by each member in the conversation (only the X first messages fetched on loading component)
   * excluding the current user. If a member has not seen any messages, it fetches
   * the last message they have seen in the DB. The function takes an array of MessageType objects
   * as input and updates the state with the last messages seen by each member.
   *
   * @param {MessageType[]} messagesArr - An array of MessageType objects representing
   * the messages in the conversation.
   * @return {boolean} This function always returns false.
   */ const lastMsgSeenByMembers = async (messagesArr: MessageType[]) => {
    const tempArray: LastMsgSeenByMembersType[] = [];
    if (displayedConv) {
      for (const member of displayedConv.members) {
        if (member.username !== user?.userName) {
          for (const msg of messagesArr) {
            if (msg.seenBy.includes(member.username)) {
              tempArray.push({ username: member.username, messageId: msg._id });
              break; //Stop after finding the first msg he has seen(the latest one)
            }
          }
          //if no msg has been seen by this member, fetches the last message he has seen

          if (tempArray.every((item) => item.username !== member.username)) {
            //console.log("PLUS DE 15 MESSAGES");
            const lastMsgIdSeenByUser = await fetchLastMsgIdSeenByUser(member.username);
            if (!lastMsgIdSeenByUser) {
              break;
            }
            tempArray.push({
              username: member.username,
              messageId: lastMsgIdSeenByUser,
            });
          }
        }
      }
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
  const handleScroll = () => {
    if (scrollViewRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollViewRef.current;
      // Vérifie si l'utilisateur est proche du bas
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 600);
    }
  };

  const addMember = (username: string) => {
    setAddedMembers((prev) => [...prev, username]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  const debouncedFetchUsers = useCallback(
    _.debounce(async (searchQuery: string) => {
      //console.log("))))))))");
      //console.log(searchQuery);
      if (searchQuery.length > 2) {
        try {
          const response = await fetch(RESTAPIUri + "/user/username?search=" + searchQuery, {
            headers: { authorization: `Bearer ${ApiToken()}` },
          });
          if (!response.ok) {
            throw new Error("Erreur lors de la recherche d'utilisateur");
          }
          const jsonData = await response.json();
          //console.log(jsonData);
          setUsersPrediction(jsonData);
          return jsonData;
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("An unknown error occurred");
          }
        }
      } else {
        return false;
      }
    }, 300),
    []
  );

  const handleSearch = (user: UserDataType) => {
    if (addedMembers.includes(user.userName)) {
      //console.log("User déja ajouté");
      setSearchUserInput("");
    } else {
      addMember(user.userName);
      setUsersPrediction([]);
    }

    setSearchUserInput("");
  };

  const searchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUserInput(e.target.value);
    debouncedFetchUsers(e.target.value);
  };

  const emitSeenMsgToSocket = async (
    messageData: MessageType,
    conversation: ConversationType | null
  ) => {
    const convMembersSocket = await getUsersSocket(conversation, user);
    const seenMsgData = messageData;
    messageData.seenBy = [user?.userName];
    const socketData = [convMembersSocket, seenMsgData, conversation];
    socket.emit("seenMessage", socketData);
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
    if (convMembersTyping.length > 2) {
      return (
        <>
          {convMembersTyping[0]}, {convMembersTyping[1]} et
          {convMembersTyping.length - 2 > 1
            ? convMembersTyping.length - 2 + " autres... "
            : " un autre..."}
        </>
      );
    } else {
      return <>{convMembersTyping.join(", ")}</>;
    }
  };

  const asyncFetchMsg = async () => {
    const fetchedMessages = await fetchMessages();
    if (!fetchedMessages || fetchedMessages.length === 0) return;

    lastMsgSeenByMembers(fetchedMessages);
    emitSeenMsgToSocket(fetchedMessages[0], displayedConv);
  };

  const handleMouseEnter = (id: string | undefined) => {
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

  const handleTextareaResize = (newTextareaHeight: number, reset?: string) => {
    if (reset) {
      setFooterHeight("7.5%");
      setBodyHeight("85%");
      return;
    }
    const maxFooterHeight = 30; //Percentage
    console.log("xx");
    console.log(newTextareaHeight);
    const newFooterHeight = Math.min(newTextareaHeight, maxFooterHeight);
    const newBodyHeight = 100 - newFooterHeight;
    console.log("làlàlà");
    console.log(newBodyHeight);
    setBodyHeight(`${newBodyHeight}%`);
    setFooterHeight(`${newFooterHeight}%`);
  };
  useEffect(() => {
    if (editingMsg) {
      setFooterHeight("12.5%");
      setBodyHeight("80%");
    } else {
      setFooterHeight("7.5%");
      setBodyHeight("85%");
    }
  }, [editingMsg]);

  useEffect(() => {
    if (displayedConv) {
      fetchMsgIndex.current = 0;
      setDroppedFiles([]);
      setShowDragOverOverlay(false);
      setMessages([]);
      setEditingMsg(null);
      setSelectedFoundMsgId("");

      console.log("MESSSSSSSAGE RESET");
      console.log(displayedConv._id);
      asyncFetchMsg();

      socket.on("message", (data) => {
        const message = data[0];
        const convId = data[1]._id;
        console.log("MESSAGE RECU");
        console.log(message);
        if (convId === displayedConv?._id) {
          setMessages((prev) => [...prev, message]);
          emitSeenMsgToSocket(message, displayedConv);
          setLastMsgSeenByConvMembers((prev) =>
            prev.map((item) =>
              item.username === message.seenBy[0] ? { ...item, messageId: message._id } : item
            )
          );
        }
      });

      socket.on("seenMessage", (data) => {
        const message = data[0];
        const conv = data[1];

        if (conv?._id === displayedConv?._id) {
          setLastMsgSeenByConvMembers((prev) =>
            prev.map((item) =>
              item.username === message.seenBy[0] ? { ...item, messageId: message._id } : item
            )
          );
        }
      });
      socket.on("typing", (data) => {
        if (data[2]._id === displayedConv?._id) {
          if (data[0] === true) {
            setConvMembersTyping((prev) => [...prev, data[1]]);
          } else if (data[0] === false) {
            setConvMembersTyping((prev) => prev.filter((item) => item !== data[1]));
          }
        } else {
          setConvMembersTyping((prev) => prev.filter((item) => item !== data[1]));
        }
      });

      socket.on("convUpdate", (conversation: ConversationType) => {
        console.log("members change écouté");
        if (conversation._id === displayedConv?._id) {
          console.log("c les meme");
          setMessages((prev) => [...prev, conversation.lastMessage]);
          emitSeenMsgToSocket(conversation.lastMessage, displayedConv);
          setLastMsgSeenByConvMembers((prev) =>
            prev.map((item) =>
              item.username === conversation.lastMessage.seenBy[0]
                ? { ...item, messageId: conversation.lastMessage._id }
                : item
            )
          );
        }
      });
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

      socket.on("changeStatus", (data) => {
        if (displayedConv?.partnerInfos?.userId === data.userId) {
          console.log("CHANGE STATUS DISPLAYED CONV");
          setDisplayedConv((prev) => {
            if (prev?.partnerInfos) {
              return {
                ...prev,
                partnerInfos: {
                  ...prev?.partnerInfos,
                  status: data.status,
                  lastSeenAt: data.lastSeenAt,
                },
              };
            }
            return prev;
          });
        }
      });
      socket.on("isUserOnline", (data) => {
        console.log("IS USER ONLINE");
        if (displayedConv?.partnerInfos?.userId === data.userId) {
          setDisplayedConv((prev) => {
            if (prev?.partnerInfos) {
              console.log("IS USER ONLINE DISPLAYED CONV");
              return {
                ...prev,
                partnerInfos: {
                  ...prev?.partnerInfos,
                  isOnline: data.isOnline,
                  lastSeen: data.lastSeen,
                },
              };
            }
            return prev;
          });
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

      //Close conversatoin details every time a new conversation is selected
    } else if (searchInputRef.current) {
      setMessages([]);
      searchInputRef.current.focus();
      setAddedMembers([]);
      setShowConvDetails(false);
    }

    return () => {
      socket.off("message");
      socket.off("seenMessage");
      socket.off("typing");
      socket.off("convUpdate");
      socket.off("newFile");
      socket.off("changeStatus");
      socket.off("isUserOnline");
      socket.off("deletedMessage");
      socket.off("changeReaction");
      socket.off("editedMessage");
    };
  }, [displayedConv?._id]);
  useEffect(() => {
    console.log(displayedConv?.partnerInfos);
  }, [displayedConv?.partnerInfos]);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }

    messages.forEach((message) => {
      if (!message._id) return;
      if (!messagesRef.current[message._id]) {
        messagesRef.current[message._id] = React.createRef<HTMLDivElement>();
      }
    });
  }, [messages.length, displayedConv?._id]);

  /* Scroll Management --------------------------------------------------------------------------------------------
    Check if the scroll height is greater than the client height and update the hasScroll state
  */
  useEffect(() => {
    const checkScroll = () => {
      if (scrollViewRef.current) {
        setHasScroll(scrollViewRef.current.scrollHeight > scrollViewRef.current.clientHeight);
        /*  console.log("CHEKC ICI");
        console.log(scrollViewRef.current.scrollHeight > scrollViewRef.current.clientHeight); */
      }
    };

    checkScroll();

    const observer = new MutationObserver(checkScroll);
    if (scrollViewRef.current) {
      observer.observe(scrollViewRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

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
    if (displayedConv === null)
      return <CreateConvFooter addedMembers={addedMembers} setAddedMembers={setAddedMembers} />;
    else if (editingMsg !== null)
      return (
        <EditingMsgFooter
          message={editingMsg}
          setEditingMsg={setEditingMsg}
          onTextAreaResize={handleTextareaResize}
          height={footerHeight}
        />
      );
    else if (
      user &&
      displayedConv.members &&
      displayedConv.members.some((member) => member.username === user.userName)
    ) {
      return (
        <NormalFooter
          setShowDragOverOverlay={setShowDragOverOverlay}
          droppedFiles={droppedFiles}
          setDroppedFiles={setDroppedFiles}
          onTextAreaResize={handleTextareaResize}
          height={footerHeight}
          quotedMessage={quotedMessage}
          setQuotedMessage={setQuotedMessage}
        />
      );
    } else return <DisabledFooter />;
  };

  useEffect(() => {
    if (quotedMessage) {
      setBodyHeight("75%");
      setFooterHeight("15%");
    } else {
      setFooterHeight("7.5%");
      setBodyHeight("85%");
    }
  }, [quotedMessage]);
  return (
    <SelectedFoundMsgIdContext.Provider value={{ selectedFoundMsgId, setSelectedFoundMsgId }}>
      <MessagesRefContext.Provider value={{ messagesRef }}>
        <div className="WindowConversation" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className={`conversation-container ${showConvDetails ? "retracted" : ""}`}>
            {showDragOverOverlay && (
              <div className="drag-overlay">
                <span>Déposer un fichier</span>{" "}
              </div>
            )}
            <div className="conversation-header">
              <div className="conversation-member-info">
                {displayedConv ? (
                  <>
                    <div className="img-container">
                      <ProfilePic props={displayedConv} />
                    </div>
                    <div className="conversation-member-info-text-container">
                      <div className="conversation-member-name">
                        {displayedConv?.isGroupConversation
                          ? displayedConv?.customization.conversationName
                            ? displayedConv?.customization.conversationName
                            : displayedConv?.members
                                .filter((item) => item.username !== user?.userName)
                                .map((member) => member.username)
                                .join(", ")
                          : displayedConv?.members
                              .filter((item) => item.username !== user?.userName)
                              .map((member) => member.username)}
                      </div>
                      <div
                        className="online-since"
                        onClick={() => {
                          console.log(displayedConv);
                        }}
                      >
                        {!displayedConv?.isGroupConversation && displayedConv?.partnerInfos
                          ? !displayedConv.partnerInfos?.isOnline ||
                            displayedConv?.partnerInfos?.status === "Offline"
                            ? "Hors ligne depuis " +
                              timeSince(new Date(displayedConv.partnerInfos.lastSeen))
                            : statusTranslate(displayedConv.partnerInfos.status)
                          : ""}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="create-conversation-add-members">
                    <label htmlFor="add-members-input">A : </label>
                    <div className="added-members-container">
                      {addedMembers.map((addedMember) => {
                        return (
                          <div className="member" key={addedMember}>
                            <span>{addedMember} </span>
                            <div
                              id="create-conversation-delete-member"
                              onClick={() =>
                                setAddedMembers((prev) =>
                                  prev.filter((item) => item !== addedMember)
                                )
                              }
                            >
                              <Close
                                color={"#0084ff"}
                                title={"Supprimer"}
                                height="1.25rem"
                                width="1.25rem"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="search-user">
                      <input
                        ref={searchInputRef}
                        type="text"
                        id="add-members-input"
                        name="add-members-input"
                        onChange={(e) => searchUser(e)}
                        value={searchUserInput}
                      />
                      <div
                        className="dropdown-search-list"
                        id={searchUserInput.length > 2 ? "visible" : ""}
                      >
                        {usersPrediction.length > 0 ? (
                          usersPrediction.map((userPrediction) => {
                            if (
                              !addedMembers.includes(userPrediction.userName) &&
                              userPrediction.userName !== user?.userName
                            ) {
                              return (
                                <li
                                  key={userPrediction._id}
                                  onClick={() => handleSearch(userPrediction)}
                                >
                                  <div className="user-profile-pic">
                                    <ProfilePic props={userPrediction.photo} />
                                  </div>
                                  <span> {userPrediction.userName}</span>
                                </li>
                              );
                            }
                          })
                        ) : (
                          <li>
                            <div className="no-user-found">
                              <span>Aucun utilisateur trouvé</span>
                            </div>
                          </li>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {displayedConv && (
                <div className="conversation-buttons">
                  <Call color={"#00000"} title="Passer un appel vocal" height="3vh" width="3vh" />
                  <Videocam
                    color={"#00000"}
                    title="Lancer un appel vidéo"
                    height="3vh"
                    width="3vh"
                  />
                  <InformationCircle
                    color={"#00000"}
                    title="Informations sur la conversation"
                    height="3vh"
                    width="3vh"
                    onClick={() => setShowConvDetails(!showConvDetails)}
                  />
                </div>
              )}
            </div>
            <div
              className="conversation-body"
              ref={scrollViewRef}
              onScroll={handleScroll}
              style={{ height: bodyHeight }}
            >
              {editingMsg && (
                <div className="editingMsgOverlay" onClick={() => setEditingMsg(null)}>
                  {" "}
                </div>
              )}
              {displayedConv && (
                <>
                  <div className="load-more-messages">
                    <span onClick={() => fetchMessages()}>Charger plus de message</span>
                  </div>
                  {!isAtBottom && hasScroll && (
                    <div className="button-go-to-last-message">
                      <button
                        onClick={() =>
                          scrollViewRef.current?.scrollTo({
                            top: scrollViewRef.current.scrollHeight,
                          })
                        }
                      >
                        <ArrowDown
                          color={"#00000"}
                          title="Défiler tout en bas"
                          height="3vh"
                          width="3vh"
                        />
                      </button>
                    </div>
                  )}
                </>
              )}

              {messages
                .sort((a, b) => {
                  return new Date(a.date).getTime() - new Date(b.date).getTime();
                })
                .map((message, index) => {
                  if (!message._id) return null;
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
                      <div className="message-container" id="message-system">
                        <ConvSystemMsg textProps={message.text[message.text.length - 1]} />
                      </div>
                    );
                  }
                  if (message?.author === user?.userName) {
                    return (
                      <div
                        key={message.author + "-" + index}
                        /*  onClick={() => {
                        if (!message._id) return;
                        console.log(message);
                        console.log(messagesRef.current[message._id]);
                      }} */
                        ref={firstMessage ? firstMessageRef : messagesRef.current[message._id]}
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
                          style={
                            editingMsg?._id === message._id
                              ? { zIndex: 1, backgroundColor: "red" }
                              : {}
                          }
                          onClick={() => console.log(quotedMessage)}
                        >
                          <MessagesOptions
                            message={message}
                            setEditingMsg={setEditingMsg}
                            setQuotedMessage={setQuotedMessage}
                          />
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
                        </div>
                        <div className="seen-by">
                          {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                            if (message._id === lastMsgSeen.messageId) {
                              return <div>{lastMsgSeen.username}</div>;
                            }
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (messages[currentMsg + 1]?.author === message?.author) {
                    return (
                      <div
                        key={message.author + "-" + index}
                        onClick={() => {
                          const test = new Date(message.date);
                          console.log(test.getTime());
                        }}
                        ref={firstMessage ? firstMessageRef : messagesRef.current[message._id]}
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
                              <div className="message-author">{message.author}</div>
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
                          <MessagesOptions message={message} setQuotedMessage={setQuotedMessage} />
                        </div>
                        <div className="seen-by">
                          {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                            if (message._id === lastMsgSeen.messageId) {
                              return <div>{lastMsgSeen.username}</div>;
                            }
                          })}
                        </div>
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
                            <div className="message-author">{message.author}</div>
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
                          <img src={image} />
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
                                  Retiré: {formatDateMsg(new Date(message.deletedForEveryoneDate))}
                                </div>
                              )}
                            </div>
                          )}
                          <AsyncMsg message={message} />
                          <MessageReactions message={message} />
                        </div>
                        <MessagesOptions message={message} setQuotedMessage={setQuotedMessage} />
                      </div>
                      <div className="seen-by">
                        {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                          if (message._id === lastMsgSeen.messageId) {
                            return <div>{lastMsgSeen.username}</div>;
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              <div className="conversation-body-bottom" style={{ display: "flex" }}>
                {convMembersTyping.length > 0 && (
                  <div className="typing-users">
                    <TypingDots /> {displayMembersTyping()}
                  </div>
                )}{" "}
              </div>
            </div>
            <div
              className="conversation-footer"
              style={{ height: footerHeight, maxHeight: "15vh" }}
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
      </MessagesRefContext.Provider>
    </SelectedFoundMsgIdContext.Provider>
  );
}

export default WindowConversation;
