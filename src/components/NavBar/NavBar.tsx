import React, { useContext } from "react";
import "./NavBar.css";
import { ExitOutline } from "react-ionicons";
import { NavBarProps } from "../../typescript/types";
import { UserContext } from "../../screens/userLoggedIn/userLoggedIn";

function NavBar(props: NavBarProps) {
  const userData = useContext(UserContext);
  return (
    <div className="NavBar">
      {userData?.userName}
      <div className="navBar-right-buttons" onClick={props.handleSignOut}>
        <ExitOutline color={"#000"} height="2rem" width="2rem" />
      </div>
    </div>
  );
}

export default NavBar;
