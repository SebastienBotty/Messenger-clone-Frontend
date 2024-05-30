import React, { createContext, useState, useEffect, useContext } from "react";
import NavBar from "../../components/NavBar/NavBar";
import WindowConversation from "../../components/WindowConversation/WindowConversation";
import SideBarConversations from "../../components/SideBarConversations/SideBarConversations";
import {
  NavBarProps,
  ConversationType,
  ConversationContextType,
  UserDataType,
} from "../../typescript/types";
import { socket } from "../../socket";
import { useLocation } from "react-router-dom";

import "./userLoggedIn.css";

const DisplayedConvContext = createContext<ConversationContextType | undefined>(
  undefined
);
export const UserContext = createContext<UserDataType | null>(null);

function UserLoggedIn({ handleSignOut }: NavBarProps) {
  const location = useLocation();
  const user = location.state;
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const patchSocketId = async (socketId: string | undefined) => {
    /*     console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    console.log(socketId); */
    try {
      const response = await fetch(
        RESTAPIUri + "/user/userId/" + user?._id + "/socketId",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ socketId: socketId }),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors du patch socketId");
      }
      const jsonData = await response.json();
      console.log("Socket Id de " + user?.userName + " : " + jsonData);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };
  socket.on("connect", () => {
    patchSocketId(socket.id);
  });

  const [displayedConv, setDisplayedConv] = useState<ConversationType | null>(
    null
  );

  useEffect(() => {
    socket.connect();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <UserContext.Provider value={user}>
      <div className="userLoggedIn">
        <NavBar handleSignOut={handleSignOut} />
        <div className="content">
          <DisplayedConvContext.Provider
            value={{ displayedConv, setDisplayedConv }}
          >
            <SideBarConversations />
            <WindowConversation />
          </DisplayedConvContext.Provider>
        </div>
      </div>
    </UserContext.Provider>
  );
}
export const useDisplayedConvContext = () => {
  const context = useContext(DisplayedConvContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
export default UserLoggedIn;
