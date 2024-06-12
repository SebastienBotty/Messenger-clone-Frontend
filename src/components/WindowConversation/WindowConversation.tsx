import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  MessageType,
  Date15minDifference,
  dayNames,
  monthNames,
  UserDataType,
  ConversationType,
} from "../../typescript/types";
import {
  AddCircle,
  Call,
  Videocam,
  InformationCircle,
  ImagesOutline,
  ThumbsUp,
  Send,
  Close,
} from "react-ionicons";

import "./WindowConversation.css";
import {
  useDisplayedConvContext,
  UserContext,
  useMostRecentConvContext,
  useTriggerContext,
} from "../../screens/userLoggedIn/userLoggedIn";
import TypingDots from "../TypingDots/TypingdDots";
import _ from "lodash";
import { ApiToken } from "../../localStorage";
import { socket } from "../../socket";

function WindowConversation() {
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
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const inputMessageRef = useRef<HTMLInputElement>(null);
  const [convMembersTyping, setConvMembersTyping] = useState<string[]>([]);
  const user = useContext(UserContext)?.userName;
  const userId = useContext(UserContext)?._id;

  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";
  const fetchMsgIndex = useRef(0);
  const limitFetchMsg: number = 20;
  const [messages, setMessages] = useState<MessageType[]>([]);

  const fetchMessages = async () => {
    const response = await fetch(
      RESTAPIUri +
        "/message/userId/" +
        userId +
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
    console.log(limitFetchMsg);
    console.log(fetchMsgIndex.current);
    try {
      if (!response.ok) {
        throw new Error("Erreur lor du fetch");
      }
      const jsonData = await response.json();
      console.log(jsonData);
      setMessages((prev) => [...prev, ...jsonData]);
      fetchMsgIndex.current += limitFetchMsg;

      const div = scrollViewRef.current;
      console.log("eeeeeeeeeeeeeeeeeeee");
      if (firstMessageRef.current) {
        firstMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }
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
          userId +
          "/privateConversation?username=" +
          user +
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
      console.log(jsonData);
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
      members: [user, ...addedMembers],
      admin: user,
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
      console.log(jsonData);
      if (jsonData._id) {
        const messageData = {
          author: user,
          authorId: userId,
          text: inputMessage,
          seen_by: [user],
          date: new Date(),
          conversationId: jsonData._id,
        };
        setInputMessage("");
        console.log(" CONVERSATION DANS POST CONVERSATION");
        console.log(jsonData);
        postMessage(messageData, jsonData);
        setDisplayedConv(jsonData);
        setAddedMembers([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
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
      console.log("pas assez de membre");
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

    const hours = String(currentDate.getHours());
    let minutes: string = "";
    if (currentDate.getMinutes() < 10) {
      minutes = "0" + String(currentDate.getMinutes());
    } else {
      minutes = String(currentDate.getMinutes());
    }

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
      )} ${previousDate.getFullYear()}, ${previousDate.getHours()}:${previousDate.getMinutes()}`;
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
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
    }
  };

  const addMember = (username: string) => {
    setAddedMembers((prev) => [...prev, username]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  const debouncedFetchUsers = useCallback(
    _.debounce(async (searchQuery) => {
      console.log("))))))))");
      console.log(searchQuery);
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
          console.log(jsonData);
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
      console.log("User déja ajouté");
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

  const sendMessage = () => {
    const messageData = {
      author: user,
      authorId: userId,

      text: inputMessage,
      seen_by: [user],
      date: new Date(),
      conversationId: displayedConv?._id,
    };
    setInputMessage("");

    postMessage(messageData);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputMessage.trim() != "") {
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
      /*  console.log(jsonData);
      console.log(displayedConv); */
      setMessages((prev) => [...prev, jsonData]); //--------------------------------------------------------------------------!!!!!!!!!!!!!!!!!
      //Reload the sideBar component to fetch the latest conversation
      setTrigger(!trigger);
      if (conversationData) {
        setMostRecentConv(conversationData);
        sendMsgToSocket(
          messageData,
          await getUsersSocket(conversationData),
          conversationData
        );
      } else {
        setMostRecentConv(displayedConv);
        sendMsgToSocket(
          messageData,
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
      ?.filter((member) => member !== user)
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
      console.log("ICI SOCKET");
      console.log(jsonData);

      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const sendMsgToSocket = (
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
    console.log(messages[messages.length - 1]);
    console.log(socketData);
    socket.emit("message", socketData);
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

  const sendUserWrittingToSocket = async (isWriting: boolean) => {
    if (displayedConv) {
      const convMembersSocket = await getUsersSocket(displayedConv);
      const socketData = [convMembersSocket, isWriting, user, displayedConv];
      socket.emit("typing", socketData);
    }
  };

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

  useEffect(() => {
    if (displayedConv) {
      console.log("ON WINDOW " + displayedConv?.isGroupConversation);
      console.log(displayedConv);
      fetchMsgIndex.current = 0;
      setMessages([]);
      fetchMessages();

      socket.on("message", (data) => {
        const message = data[0];
        const convId = data[1]._id;

        if (convId === displayedConv?._id) {
          console.log("bonne conv");
          setMessages((prev) => [...prev, message]);
        } else {
          console.log("pas bonne conv");
        }
      });
      socket.on("typing", (data) => {
        console.log(data);
        if (data[2]._id === displayedConv?._id) {
          if (data[0] === true) {
            setConvMembersTyping((prev) => [...prev, data[1]]);
          } else if (data[0] === false) {
            setConvMembersTyping((prev) =>
              prev.filter((item) => item !== data[1])
            );
          }
        }
      });
    } else if (searchInputRef.current) {
      setMessages([]);
      searchInputRef.current.focus();
      setAddedMembers([]);
    }
    return () => {
      socket.off("message");
    };
  }, [displayedConv]);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom, displayedConv]);
  return (
    <div className="WindowConversation">
      <div className="conversation-header">
        <div className="conversation-member-info">
          {displayedConv ? (
            <>
              <div className="img-container">
                <img src={image} />
              </div>
              <div className="conversation-member-info-text-container">
                <div className="conversation-member-name">
                  {displayedConv?.members
                    .filter((item) => item !== user)
                    .join(", ")}
                </div>
                <div className="online-since">En ligne depuis X</div>
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
                        userPrediction.userName !== user
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
          <div className="load-more-messages">
            <span onClick={() => fetchMessages()}>Charger plus de message</span>
          </div>
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

            if (message?.author === user) {
              return (
                <div
                  key={message.author + "-" + index}
                  onClick={() => console.log(message)}
                  ref={firstMessage ? firstMessageRef : null}
                >
                  {checkMsgTime.isMoreThan15Minutes && (
                    <div className="message-container" id="Time-center-display">
                      {compareNowToDate(checkMsgTime.date) ||
                        checkMsgTime.hours + " : " + checkMsgTime.minutes}
                    </div>
                  )}
                  <div className="message-container" id="message-me">
                    <div
                      className="message"
                      ref={lastMessage ? messagesEndRef : null}
                    >
                      {message.text}
                    </div>
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
                    <div className="message-container" id="Time-center-display">
                      {compareNowToDate(checkMsgTime.date) ||
                        checkMsgTime.hours + " : " + checkMsgTime.minutes}
                    </div>
                  )}
                  <div className="message-author-name">
                    {messages[currentMsg]?.author !==
                      messages[currentMsg - 1]?.author &&
                      displayedConv?.isGroupConversation && (
                        <div className="message-author">{message.author}</div>
                      )}
                  </div>

                  <div className="message-container" id="message-others">
                    <div className="img-container"> </div>
                    <div
                      className="message"
                      ref={lastMessage ? messagesEndRef : null}
                    >
                      {message.text}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className="message-container" id="message-others">
                <div className="img-container">
                  <img src={image} />
                </div>
                <div className="message">{message.text}</div>
              </div>
            );
          })}
        <div className="conversation-body-bottom" style={{ display: "flex" }}>
          {convMembersTyping.length > 0 && (
            <div className="typing-users">
              <TypingDots /> {displayMembersTyping()}
            </div>
          )}
        </div>
      </div>
      <div className="conversation-footer">
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
                title="Joindre un fichier"
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
          style={inputMessage ? { width: "95%" } : {}}
        >
          <input
            type="text"
            className="send-message"
            placeholder="Aa"
            value={inputMessage}
            onKeyDown={handleKeyDown}
            ref={inputMessageRef}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputMessage(e.target.value)
            }
            onFocus={() => sendUserWrittingToSocket(true)}
            onBlur={() => sendUserWrittingToSocket(false)}
          />
        </div>
        <div className="like-icon">
          {inputMessage ? (
            <Send
              color={"#00000"}
              height="3vh"
              width="3vh"
              onClick={() =>
                displayedConv ? sendMessage() : createConversation()
              }
            />
          ) : (
            <ThumbsUp
              color={"#00000"}
              title="Envoyer un j'aime"
              height="3vh"
              width="3vh"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default WindowConversation;
