import React from "react";
import "./NavBar.css";
import { ExitOutline } from "react-ionicons";

interface NavBarProps {
  handleSignOut: () => void;
}

function NavBar(props: NavBarProps) {
  return (
    <div className="NavBar">
      <div className="navBar-right-buttons" onClick={props.handleSignOut}>
        <ExitOutline color={"#000"} height="2rem" width="2rem" />
      </div>
    </div>
  );
}

export default NavBar;
