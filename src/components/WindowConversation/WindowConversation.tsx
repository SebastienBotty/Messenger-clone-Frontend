import React, { useState, useRef, useEffect } from "react";
import {
  MessageType,
  Date15minDifference,
  dayNames,
  monthNames,
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

function WindowConversation() {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const user = "me";
  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";

  const [messages, setMessages] = useState<MessageType[]>([
    {
      author: "John",
      text: "ça va? ",
      seen_by: ["Alice", "Bob"],
      date: new Date("2024-05-10T09:16:00"),
    },
    {
      author: "John",
      text: "Tu racontes quoi",
      seen_by: ["John", "Bob"],
      date: new Date("2024-05-07T09:20:00"),
    },
    {
      author: "me",
      text: "Hey, what's up?",
      seen_by: ["Alice", "Bob"],
      date: new Date("2024-05-10T09:40:00"),
    },
    {
      author: "me",
      text: "On est là tu connais",
      seen_by: ["Alice", "Bob"],
      date: new Date("2024-05-16T09:41:00"),
    },
    {
      author: "me",
      text: "Hamdoullah comme on dit?",
      seen_by: ["Alice", "Bob"],
      date: new Date("2024-05-16T09:57:00"),
    },
    {
      author: "John",
      text: "Cool je suis content pour toi",
      seen_by: ["Alice", "Bob"],
      date: new Date("2024-05-16T10:00:00"),
    },
    {
      author: "John",
      text: "Not much, just chilling.",
      seen_by: ["Alice", "me"],
      date: new Date("2024-05-16T10:12:00"),
    },
    {
      author: "me",
      text: "Cool!",
      seen_by: ["Alice", "Bob"],
      date: new Date("2024-05-16T22:40:00"),
    },
  ]);

  const isMoreThan15Minutes = (
    currentDate: Date,
    previousDate: Date
  ): Date15minDifference => {
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
  const compareNowToDate = (previousDate: Date): string | false => {
    const currentDate = new Date();
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
        console.log(inputMessage);
        setMessages((prev) => [
          ...prev,
          {
            author: user,
            text: inputMessage,
            seen_by: [user],
            date: new Date(),
          },
        ]);
      }

      setInputMessage("");
    }
  };

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);
  return (
    <div className="WindowConversation">
      <div className="conversation-header">
        <div className="conversation-member-info">
          <div className="img-container">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=" />
          </div>
          <div className="conversation-member-info-text-container">
            <div className="conversation-member-name">Alexis Horny</div>
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
        {messages.map((message, index) => {
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
          if (message.author === user) {
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
          if (messages[currentMsg + 1].author === message.author) {
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
