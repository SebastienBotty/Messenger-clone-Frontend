import React, { createContext, useState, useEffect, useContext } from "react";
import NavBar from "../../components/NavBar/NavBar";
import WindowConversation from "../../components/WindowConversation/WindowConversation";
import SideBarConversations from "../../components/SideBarConversations/SideBarConversations";
import {
  NavBarProps,
  ConversationType,
  ConversationContextType,
} from "../../typescript/types";
import { socket } from "../../socket";

import "./userLoggedIn.css";

const DisplayedConvContext = createContext<
  ConversationContextType | undefined
>(undefined);

function UserLoggedIn({ handleSignOut }: NavBarProps) {
  socket.on("connect", () => console.log("Socket connecté : " + socket.id));
  const [displayedConv, setDisplayedConv] = useState<ConversationType | null>(
    null
  );
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  useEffect(() => {
    return () => {};
  }, []);

  return (
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
  );
}
export const useDisplayedConvContext = ()=>{
  const context = useContext(DisplayedConvContext)
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}
export default UserLoggedIn;
