import React, { useContext } from "react";
import { UserContext } from "../../App";
import "./NavBar.css";
import { ExitOutline } from "react-ionicons";
import { NavBarProps } from "../../typescript/types";

function NavBar(props: NavBarProps) {
  const user = useContext(UserContext);
  return (
    <div className="NavBar">
      <span>{user && user.email}</span>

      <div className="navBar-right-buttons" onClick={props.handleSignOut}>
        <ExitOutline color={"#000"} height="2rem" width="2rem" />
      </div>
    </div>
  );
}

export default NavBar;
