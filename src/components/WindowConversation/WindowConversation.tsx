import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageType,
  Date15minDifference,
  UserDataType,
  ConversationType,
  LastMsgSeenByMembersType,
  MediasType,
} from "../../typescript/types";
import { dayNames, monthNames } from "../../constants/time";
import {
  AddCircle,
  Call,
  Videocam,
  InformationCircle,
  ImagesOutline,
  Send,
  Close,
  ArrowDown,
} from "react-ionicons";

import "./WindowConversation.css";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
  useTriggerContext,
} from "../../screens/userLoggedIn/userLoggedIn";
import {
  MessagesContext,
  SelectedFoundMsgIdContext,
  ConversationFilesContext,
  ConversationMediasContext,
  useUserContext,
} from "../../constants/context";
import TypingDots from "../Utiles/TypingDots/TypingdDots";
import _ from "lodash";
import { ApiToken } from "../../localStorage";
import { socket } from "../../socket";

import AsyncMsg from "./AsyncMsg/AsyncMsg";
import ConversationDetails from "./ConversationDetails/ConversationDetails";
import ConvSystemMsg from "./ConvSystemMsg/ConvSystemMsg";
import { checkCacheFile } from "../../functions/cache";
import { getFileTypeFromPathName } from "../../functions/file";
import ProfilePic from "../Utiles/ProfilePic/ProfilePic";
import { timeSince } from "../../functions/time";
import { statusTranslate } from "../../constants/status";

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
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();
  const { trigger, setTrigger } = useTriggerContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [convMembersTyping, setConvMembersTyping] = useState<string[]>([]);
  const [lastMsgSeenByConvMembers, setLastMsgSeenByConvMembers] = useState<
    LastMsgSeenByMembersType[]
  >([]);
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const inputMessageRef = useRef<HTMLTextAreaElement>(null);
  const { user, setUser } = useUserContext();

  // POST Files handling
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [showDragOverOverlay, setShowDragOverOverlay] =
    useState<boolean>(false);

  //Handling files view in conversationDetails
  const [mediasCtxt, setMediasCtxt] = useState<MediasType[]>([]);
  const [filesCtxt, setFilesCtxt] = useState<MediasType[]>([]);

  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";
  const fetchMsgIndex = useRef(0);
  const limitFetchMsg: number = 20;
  const [messages, setMessages] = useState<MessageType[]>([]);

  const [showConvDetails, setShowConvDetails] = useState<boolean>(false); //Displays conversation details

  const [selectedFoundMsgId, setSelectedFoundMsgId] = useState<string>(""); //Stocks the id of the message that was found by the search bar

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
        if (member !== user?.userName) {
          for (const msg of messagesArr) {
            if (msg.seenBy.includes(member)) {
              tempArray.push({ username: member, messageId: msg._id });
              break; //Stop after finding the first msg he has seen(the latest one)
            }
          }
          //if no msg has been seen by this member, fetches the last message he has seen

          if (tempArray.every((item) => item.username !== member)) {
            //console.log("PLUS DE 15 MESSAGES");
            const lastMsgIdSeenByUser = await fetchLastMsgIdSeenByUser(member);
            if (!lastMsgIdSeenByUser) {
              break;
            }
            tempArray.push({
              username: member,
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

  // Check if a private conversation between 2 users already exists
  const isPrivateConvExisting = async () => {
    try {
      const response = await fetch(
        RESTAPIUri +
          "/conversation/userId/" +
          user?._id +
          "/privateConversation?username=" +
          user?.userName +
          "&recipient=" +
          addedMembers[0],
        {
          headers: { authorization: `Bearer ${ApiToken()}` },
        }
      );
      if (!response.ok) {
        throw new Error("Erreur de la vérif isPrivateConvExisting");
      }

      const jsonData = await response.json();
      //console.log(jsonData);
      if (jsonData === false) {
        postConversation();
      } else {
        setDisplayedConv(jsonData);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const postConversation = async () => {
    const postData = {
      members: [user?.userName, ...addedMembers],
      admin: user?.userName,
      creationDate: new Date(),
    };
    try {
      const response = await fetch(RESTAPIUri + "/conversation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${ApiToken()}`,
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        throw new Error("Erreur lors du POST conversations");
      }
      const jsonData = await response.json();
      //console.log(jsonData);
      if (jsonData._id) {
        const messageData = {
          author: user?.userName,
          authorId: user?._id,
          text: inputMessage,
          seenBy: [user?.userName],
          date: new Date(),
          conversationId: jsonData._id,
        };
        setInputMessage("");
        //console.log(" CONVERSATION DANS POST CONVERSATION");
        //console.log(jsonData);
        postMessage(messageData, jsonData);
        setDisplayedConv(jsonData);
        setAddedMembers([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        //console.log(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };
  const createConversation = async () => {
    if (addedMembers.length > 1) {
      postConversation();
    } else if (addedMembers.length == 1) {
      //If user wants to create a conversation with only one person, it first checks in his conversations
      isPrivateConvExisting(); //if he doesn't already have a private (not a group where ppl left and they are only 2 left) conversation with the selected person.
      //If not, creates the conversation, if yes,displays the conversation
    } else {
      //console.log("pas assez de membre");
    }
  };

  const isMoreThan15Minutes = (
    currentDateToForm: Date,
    previousDateToForm: Date
  ): Date15minDifference => {
    const currentDate = new Date(currentDateToForm);
    const previousDate = new Date(previousDateToForm);
    const differenceInMilliseconds = Math.abs(
      previousDate.getTime() - currentDate.getTime()
    );
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000;
    const isMoreThan15Minutes =
      differenceInMilliseconds > fifteenMinutesInMilliseconds;

    let hours: string = String(
      currentDate.getHours() < 10
        ? "0" + currentDate.getHours()
        : currentDate.getHours()
    );

    let minutes: string = String(
      currentDate.getMinutes() < 10
        ? "0" + currentDate.getMinutes()
        : currentDate.getMinutes()
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
  const compareNowToDate = (previousDateToForm: Date): string | false => {
    const currentDate = new Date();
    const previousDate = new Date(previousDateToForm);
    const differenceInMilliseconds = Math.abs(
      previousDate.getTime() - currentDate.getTime()
    );
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
    const differenceInDays = differenceInMinutes / 60 / 24;

    if (differenceInDays > 7) {
      const formattedDate = `${previousDate.getDate()} ${monthNames[
        previousDate.getMonth()
      ].substring(
        0,
        3
      )} ${previousDate.getFullYear()}, ${previousDate.getHours()}:${
        previousDate.getMinutes() < 10
          ? "0" + previousDate.getMinutes()
          : previousDate.getMinutes()
      }`;
      return formattedDate;
    } else if (previousDate.getDate() < currentDate.getDate()) {
      const formattedDate = `${dayNames[previousDate.getDay()].substring(
        0,
        3
      )} ${previousDate.getHours()}:${previousDate.getMinutes()}`;
      return formattedDate;
    } else {
      return false;
    }
  };

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
          const response = await fetch(
            RESTAPIUri + "/user/username?search=" + searchQuery,
            {
              headers: { authorization: `Bearer ${ApiToken()}` },
            }
          );
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

  const sendMessage = (fileNames?: string[]) => {
    const trimmedString = inputMessage.replace(/^\s+|\s+$/g, "");

    const messageData = {
      author: user?.userName,
      authorId: user?._id,

      text: fileNames
        ? "PATHIMAGE/" +
          displayedConv?._id +
          ":" +
          fileNames.map((name) => name).join(",")
        : trimmedString,
      seenBy: [user?.userName],
      date: new Date(),
      conversationId: displayedConv?._id,
    };
    //console.log("iciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    //console.log(messageData.text);
    setInputMessage("");

    postMessage(messageData);
  };

  const sendEmoji = () => {
    if (!displayedConv) return;
    const messageData = {
      author: user?.userName,
      authorId: user?._id,
      text: displayedConv.customization.emoji,
      seenBy: [user?.userName],
      date: new Date(),
      conversationId: displayedConv?._id,
    };
    postMessage(messageData);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && inputMessage.trim() != "" && !event.shiftKey) {
      event.preventDefault();
      if (displayedConv) {
        sendMessage();
      } else {
        createConversation();
      }
    }
  };

  const postMessage = async (
    messageData: MessageType,
    conversationData?: ConversationType
  ) => {
    try {
      const response = await fetch(RESTAPIUri + "/message/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) {
        throw new Error("Erreur lors du POST MEssage");
      }
      const jsonData = await response.json();
      //console.log(jsonData);
      //console.log(displayedConv);
      setMessages((prev) => [...prev, jsonData]); //--------------------------------------------------------------------------!!!!!!!!!!!!!!!!!
      //Reload the sideBar component to fetch the latest conversation
      setTrigger(!trigger);
      if (conversationData) {
        setMostRecentConv(conversationData);
        emitMsgToSocket(
          jsonData,
          await getUsersSocket(conversationData),
          conversationData
        );
      } else {
        setMostRecentConv(displayedConv);
        emitMsgToSocket(
          jsonData,
          await getUsersSocket(displayedConv),
          displayedConv
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const getUsersSocket = async (conversation: ConversationType | null) => {
    const convMembersStr = conversation?.members
      ?.filter((member) => member !== user?.userName)
      .join("-");
    try {
      const response = await fetch(
        RESTAPIUri + "/user/getSockets?convMembers=" + convMembersStr,
        {
          headers: {
            Authorization: "Bearer " + ApiToken(),
          },
        }
      );
      const jsonData = await response.json();
      //console.log("ICI SOCKET");
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

  const emitMsgToSocket = (
    messageData: MessageType,
    convMembersSocket: Promise<any>,
    conversation: ConversationType | null
  ) => {
    const socketData =
      conversation == displayedConv
        ? [
            convMembersSocket,
            messageData,
            conversation,
            messages[messages.length - 1],
          ]
        : [convMembersSocket, messageData, conversation];
    //console.log(messages[messages.length - 1]);
    //console.log(socketData);
    socket.emit("message", socketData);
  };
  const emitSeenMsgToSocket = async (
    messageData: MessageType,
    conversation: ConversationType | null
  ) => {
    const convMembersSocket = await getUsersSocket(conversation);
    const seenMsgData = messageData;
    messageData.seenBy = [user?.userName];
    const socketData = [convMembersSocket, seenMsgData, conversation];
    socket.emit("seenMessage", socketData);
  };

  const emitUserWrittingToSocket = async (isWriting: boolean) => {
    if (displayedConv) {
      const convMembersSocket = await getUsersSocket(displayedConv);
      const socketData = [
        convMembersSocket,
        isWriting,
        user?.userName,
        displayedConv,
      ];
      socket.emit("typing", socketData);
    }
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
  useEffect(() => {
    setInputMessage("");
    if (displayedConv) {
      fetchMsgIndex.current = 0;
      setDroppedFiles([]);
      setShowDragOverOverlay(false);
      setMessages([]);
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
              item.username === message.seenBy[0]
                ? { ...item, messageId: message._id }
                : item
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
              item.username === message.seenBy[0]
                ? { ...item, messageId: message._id }
                : item
            )
          );
        }
      });
      socket.on("typing", (data) => {
        if (data[2]._id === displayedConv?._id) {
          if (data[0] === true) {
            setConvMembersTyping((prev) => [...prev, data[1]]);
          } else if (data[0] === false) {
            setConvMembersTyping((prev) =>
              prev.filter((item) => item !== data[1])
            );
          }
        } else {
          setConvMembersTyping((prev) =>
            prev.filter((item) => item !== data[1])
          );
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
      socket.off("isUserONline");
    };
  }, [displayedConv?._id]);
  useEffect(() => {
    console.log(displayedConv?.partnerInfos);
  }, [displayedConv?.partnerInfos]);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages, displayedConv?._id]);

  // Files Management ----------------------------------------------------------------------------------------------
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!showDragOverOverlay) {
        setShowDragOverOverlay(true);
      }
    },
    []
  );

  const calculateTotalSize = (files: File[]): number => {
    return files.reduce((totalSize, file) => totalSize + file.size, 0);
  };

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
  const formatFileSize = (size: number): string => {
    if (size === 0) return "0 o";

    const units = ["o", "Ko", "Mo", "Go", "To"];
    const digitGroups = Math.floor(Math.log(size) / Math.log(1024));

    return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${
      units[digitGroups]
    }`;
  };

  const deleteSelectedFile = (index: number) => {
    setDroppedFiles((prev) => prev.filter((_, i) => i !== index));
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };
  const filePreview = () => {
    return (
      <div className="file-preview-container">
        {droppedFiles.map((file, index) => (
          <div key={index} className="file-preview-item">
            <div
              className="delete-file"
              onClick={() => deleteSelectedFile(index)}
            >
              <Close
                color={"red"}
                title={"Supprimer"}
                height="1.5rem"
                width="1.5rem"
              />
            </div>
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${file.name}`}
                className="file-preview-image"
              />
            ) : (
              <div className="file-icon">
                <img
                  src="/file-icon.png"
                  alt={`File Icon`}
                  className="file-icon-img"
                />
                <div className="file-name">{file.name}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArr = Array.from(files);
      checkFiles(filesArr);
    }
  };

  const openFileInput = (e: React.MouseEvent) => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const uploadFiles = async () => {
    if (droppedFiles.length < 1) {
      return;
    }
    const filesFormData = new FormData();
    for (const file of droppedFiles) {
      filesFormData.append("files", file);
    }
    //console.log(droppedFiles);
    //console.log(filesFormData);

    try {
      const response = await fetch(
        RESTAPIUri + "/file/upload/" + displayedConv?._id,
        {
          method: "POST",

          headers: {
            authorization: `Bearer ${ApiToken()}`,
          },
          body: filesFormData,
        }
      );
      if (!response.ok) {
        throw new Error("Error uploading files");
      }
      const data = await response.json();
      //console.log(data);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      setDroppedFiles([]);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const sendFile = async () => {
    const fileNamesTimeStamped = await uploadFiles();
    console.log("fichiers envoyés");
    console.log(fileNamesTimeStamped);
    await sendMessage(fileNamesTimeStamped.fileNames);
    //console.log("msg envoyé");
  };
  return (
    <div
      className="WindowConversation"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <MessagesContext.Provider value={{ messages, setMessages }}>
        <div
          className={`conversation-container ${
            showConvDetails ? "retracted" : ""
          }`}
        >
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
                              .filter((item) => item !== user?.userName)
                              .join(", ")
                        : displayedConv?.members.filter(
                            (item) => item !== user?.userName
                          )}
                    </div>
                    <div
                      className="online-since"
                      onClick={() => {
                        console.log(displayedConv);
                      }}
                    >
                      {!displayedConv?.isGroupConversation &&
                      displayedConv?.partnerInfos
                        ? !displayedConv.partnerInfos?.isOnline ||
                          displayedConv?.partnerInfos?.status === "Offline"
                          ? "Hors ligne depuis " +
                            timeSince(
                              new Date(displayedConv.partnerInfos.lastSeen)
                            )
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
                                  <img src={image} />
                                </div>
                                <span> {userPrediction.userName}</span>
                              </li>
                            );
                          }
                        })
                      ) : (
                        <li className="user-profile-pic">
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
                <Call
                  color={"#00000"}
                  title="Passer un appel vocal"
                  height="3vh"
                  width="3vh"
                />
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
          >
            {displayedConv && (
              <>
                <div className="load-more-messages">
                  <span onClick={() => fetchMessages()}>
                    Charger plus de message
                  </span>
                </div>
                <div
                  className="button-go-to-last-message"
                  style={
                    isAtBottom ? { display: "none" } : { display: "block" }
                  }
                >
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
              </>
            )}

            {messages
              .sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              })
              .map((message, index) => {
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
                if (message.author === "System/" + displayedConv?._id) {
                  return (
                    <div className="message-container" id="message-system">
                      <ConvSystemMsg textProps={message.text} />
                    </div>
                  );
                }
                if (message?.author === user?.userName) {
                  return (
                    <div
                      key={message.author + "-" + index}
                      onClick={() => console.log(message)}
                      ref={firstMessage ? firstMessageRef : null}
                    >
                      {checkMsgTime.isMoreThan15Minutes && (
                        <div
                          className="message-container"
                          id="Time-center-display"
                        >
                          {compareNowToDate(checkMsgTime.date) ||
                            checkMsgTime.hours + " : " + checkMsgTime.minutes}
                        </div>
                      )}
                      <div className="message-container" id="message-me">
                        <div
                          className={`message ${
                            selectedFoundMsgId === message._id
                              ? "selectedFoundMsg"
                              : ""
                          }`}
                          ref={lastMessage ? messagesEndRef : null}
                        >
                          <AsyncMsg
                            text={message?.text}
                            convId={displayedConv?._id}
                          />
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
                    >
                      {checkMsgTime.isMoreThan15Minutes && (
                        <div
                          className="message-container"
                          id="Time-center-display"
                        >
                          {compareNowToDate(checkMsgTime.date) ||
                            checkMsgTime.hours + " : " + checkMsgTime.minutes}
                        </div>
                      )}
                      {messages[currentMsg]?.author !==
                        messages[currentMsg - 1]?.author &&
                        displayedConv?.isGroupConversation && (
                          <div className="message-author-name">
                            <div className="message-author">
                              {message.author}
                            </div>
                          </div>
                        )}

                      <div className="message-container" id="message-others">
                        <div className="img-container"> </div>
                        <div
                          className={`message ${
                            selectedFoundMsgId === message._id
                              ? "selectedFoundMsg"
                              : ""
                          }`}
                          ref={lastMessage ? messagesEndRef : null}
                        >
                          <AsyncMsg
                            text={message?.text}
                            convId={displayedConv?._id}
                          />
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
                return (
                  <>
                    {messages[currentMsg]?.author !==
                      messages[currentMsg - 1]?.author &&
                      displayedConv?.isGroupConversation && (
                        <div className="message-author-name">
                          <div className="message-author">{message.author}</div>
                        </div>
                      )}
                    <div className="message-container" id="message-others">
                      <div className="img-container">
                        <img src={image} />
                      </div>
                      <div
                        className={`message ${
                          selectedFoundMsgId === message._id
                            ? "selectedFoundMsg"
                            : ""
                        }`}
                        ref={lastMessage ? messagesEndRef : null}
                        onClick={() => console.log(message)}
                      >
                        <AsyncMsg
                          text={message?.text}
                          convId={displayedConv?._id}
                        />
                      </div>
                    </div>
                    <div className="seen-by">
                      {lastMsgSeenByConvMembers.map((lastMsgSeen) => {
                        if (message._id === lastMsgSeen.messageId) {
                          return <div>{lastMsgSeen.username}</div>;
                        }
                      })}
                    </div>
                  </>
                );
              })}
            <div
              className="conversation-body-bottom"
              style={{ display: "flex" }}
            >
              {convMembersTyping.length > 0 && (
                <div className="typing-users">
                  <TypingDots /> {displayMembersTyping()}
                </div>
              )}
            </div>
          </div>
          <div className="conversation-footer">
            {(user && displayedConv?.members.includes(user.userName)) ||
            displayedConv == null ? (
              <>
                <div className="icons">
                  <AddCircle
                    color={"#00000"}
                    title="Ouvrir plus d'actions"
                    height="3vh"
                    width="3vh"
                    style={{ marginRight: "0.5rem" }}
                  />
                  {!inputMessage && (
                    <>
                      <ImagesOutline
                        onClick={openFileInput}
                        title="Joindre un fichier"
                        color={"#00000"}
                        height="3vh"
                        width="3vh"
                        style={{ transform: "rotate(270deg)" }}
                      />
                      <ImagesOutline
                        onClick={() => console.log(droppedFiles)}
                        color={"#00000"}
                        height="3vh"
                        width="3vh"
                        style={{ transform: "rotate(270deg)" }}
                      />
                      <ImagesOutline
                        color={"#00000"}
                        height="3vh"
                        width="3vh"
                        style={{ transform: "rotate(270deg)" }}
                      />
                    </>
                  )}
                </div>
                <div
                  className="message-input"
                  style={inputMessage ? { flex: "auto" } : {}}
                >
                  <input
                    type="file"
                    ref={inputFileRef}
                    style={{ display: "none" }}
                    multiple
                    onChange={handleFileChange}
                  />
                  {droppedFiles.length > 0 ? (
                    <div>{filePreview()}</div>
                  ) : (
                    <textarea
                      className="send-message"
                      placeholder="Aa"
                      value={inputMessage}
                      rows={3}
                      onKeyDown={handleKeyDown}
                      ref={inputMessageRef}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setInputMessage(e.target.value)
                      }
                      onFocus={() => emitUserWrittingToSocket(true)}
                      onBlur={() => emitUserWrittingToSocket(false)}
                    />
                  )}
                </div>
                <div className="like-icon">
                  {inputMessage || droppedFiles.length > 0 ? (
                    <Send
                      color={"#00000"}
                      height="3vh"
                      width="3vh"
                      onClick={() =>
                        droppedFiles
                          ? sendFile()
                          : displayedConv
                          ? sendMessage()
                          : createConversation()
                      }
                    />
                  ) : (
                    <div
                      style={{ cursor: "pointer", fontSize: "1.5rem" }}
                      onClick={() => sendEmoji()}
                    >
                      {displayedConv?.customization.emoji}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="disabled-footer">
                <div>
                  Vous ne pouvez pas envoyer de message dans cette discussion
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className={`conversation-details ${
            showConvDetails ? "expanded" : ""
          }`}
        >
          {showConvDetails && (
            <ConversationMediasContext.Provider
              value={{ mediasCtxt, setMediasCtxt }}
            >
              <ConversationFilesContext.Provider
                value={{ filesCtxt, setFilesCtxt }}
              >
                <SelectedFoundMsgIdContext.Provider
                  value={{ selectedFoundMsgId, setSelectedFoundMsgId }}
                >
                  <ConversationDetails />
                </SelectedFoundMsgIdContext.Provider>
              </ConversationFilesContext.Provider>
            </ConversationMediasContext.Provider>
          )}
        </div>
      </MessagesContext.Provider>
    </div>
  );
}

export default WindowConversation;
