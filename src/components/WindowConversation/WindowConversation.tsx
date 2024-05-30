import React, { useState, useRef, useEffect } from "react";
import {
  MessageType,
  Date15minDifference,
  dayNames,
  monthNames,
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
} from "react-ionicons";

import "./WindowConversation.css";
import {
  useDisplayedConvContext,
  UserContext,
} from "../../screens/userLoggedIn/userLoggedIn";

function WindowConversation() {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const user = "me";
  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";
  const fetchMsgIndex = useRef(0);
  const limitFetchMsg: number = 10;
  const [messages, setMessages] = useState<MessageType[]>([]);

  const fetchMessages = async () => {
    const response = await fetch(
      RESTAPIUri +
        "/message/conversationId/" +
        displayedConv?._id +
        "/getMessages?start=" +
        fetchMsgIndex.current +
        "&limit=" +
        limitFetchMsg
    );
    try {
      if (!response.ok) {
        throw new Error("Erreur lor du fetch");
      }
      const jsonData = await response.json();
      //console.log(jsonData);
      setMessages((prev) => [...prev, ...jsonData]);
      fetchMsgIndex.current += limitFetchMsg;
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

  const sendMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (inputMessage.trim() != "") {
        setMessages((prev) => [
          ...prev,
          {
            author: user,
            text: inputMessage,
            seen_by: [user],
            date: new Date(),
            conversationId: "test", //TODO : MODIFY IT TO CONVERSATION ID _______________________________________________
          },
        ]);
      }

      setInputMessage("");
    }
  };

  useEffect(() => {
    fetchMsgIndex.current = 0;
    setMessages([]);
    fetchMessages();
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
          <div className="img-container">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=" />
          </div>
          <div className="conversation-member-info-text-container">
            <div className="conversation-member-name">
              {displayedConv?.members?.join(", ")}
            </div>
            <div className="online-since">En ligne depuis X</div>
          </div>
        </div>
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
      </div>
      <div
        className="conversation-body"
        ref={scrollViewRef}
        onScroll={handleScroll}
      >
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
            const lastMessage = index === messages.length - 1;
            const currentMsg = messages.indexOf(message);
            if (message?.author === user) {
              return (
                <>
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
                </>
              );
            }
            if (messages[currentMsg + 1]?.author === message?.author) {
              return (
                <>
                  {checkMsgTime.isMoreThan15Minutes && (
                    <div className="message-container" id="Time-center-display">
                      {compareNowToDate(checkMsgTime.date) ||
                        checkMsgTime.hours + " : " + checkMsgTime.minutes}
                    </div>
                  )}
                  <div className="message-container" id="message-others">
                    <div className="img-container"> </div>
                    <div
                      className="message"
                      ref={lastMessage ? messagesEndRef : null}
                    >
                      {message.text}
                    </div>
                  </div>
                </>
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
        <form></form>
        <div
          className="message-input"
          style={inputMessage ? { width: "95%" } : {}}
        >
          <input
            type="text"
            className="send-message"
            placeholder="Aa"
            value={inputMessage}
            onKeyDown={sendMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputMessage(e.target.value)
            }
          />
        </div>
        <div className="like-icon">
          {inputMessage ? (
            <Send color={"#00000"} height="3vh" width="3vh" />
          ) : (
            <ThumbsUp
              onClick={() => fetchMessages()}
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
