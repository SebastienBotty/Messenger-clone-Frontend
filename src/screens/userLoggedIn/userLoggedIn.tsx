import React, { useContext } from "react";
import { UserContext } from "../../App";
import NavBar from "../../components/NavBar/NavBar";
import WindowConversation from "../../components/WindowConversation/WindowConversation";
import SideBarConversations from "../../components/SideBarConversations/SideBarConversations";
import { NavBarProps } from "../../typescript/types";
import { socket } from "../../socket";

import "./userLoggedIn.css";

function UserLoggedIn({ handleSignOut }: NavBarProps) {
  socket.on("connect", () => console.log("Socket connecté : " + socket.id));
  console.log(socket.id);

  return (
    <div className="userLoggedIn">
      <NavBar handleSignOut={handleSignOut} />
      <div className="content">
        <SideBarConversations />
        <WindowConversation />
      </div>
    </div>
  );
}

export default UserLoggedIn;
