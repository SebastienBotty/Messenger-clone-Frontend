import React, { useState } from "react";
import {
  CreateOutline,
  EllipsisHorizontal,
  SearchOutline,
} from "react-ionicons";
import { ConversationType, MessageType } from "../../typescript/types";
import "./SideBarConversations.css";

function SideBarConversations() {
  const [searchConversation, setSearchConversation] = useState<string>("");
  const [conversations, setConversations] = useState<ConversationType[]>([
    {
      name: "Bob",
      photo:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
      lastMessage: {
        author: "Jane Doe",
        text: "Hello, this is a message.",
        seen_by: ["John Doe", "Alice Smith"],
        date: new Date("2023-05-16T09:24:00"),
      },
    },
    {
      name: "Bob",
      photo:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=",
      lastMessage: {
        author: "Jane Doe",
        text: "Hello, this is a message. BUT HIS MESSAHE IS VERY VERY LONG U KNOW",
        seen_by: ["John Doe", "Alice Smith"],
        date: new Date("2024-05-16T15:24:00"),
      },
    },
  ]);

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

    return "Il y a un certain temps";
  };

  // Exemple d'utilisation
  const pastDate = new Date("2024-05-15T12:00:00");
  console.log(timeSince(pastDate));

  return (
    <div className="SideBarConversations">
      <div className="sideBar-header">
        <div className="first-line">
          <div className="first-line-title">Discussions</div>
          <div className="sideBar-header-buttons">
            <EllipsisHorizontal
              color={"#00000"}
              title="Paramètres"
              height="2rem"
              width="2rem"
            />
            <CreateOutline
              color={"#00000"}
              title="Nouvelle discussion"
              height="2rem"
              width="2rem"
            />
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
        {conversations.map((conversation: ConversationType) => {
          return (
            <div className="conversation">
              <div className="conversation-img-container">
                <img src={conversation.photo} />
              </div>
              <div className="conversation-text-container">
                <div id="conversation-name">{conversation.name}</div>
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
