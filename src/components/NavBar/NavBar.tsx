import React, { useContext } from "react";
import "./NavBar.css";
import { NavBarProps } from "../../typescript/types";
import { UserContext } from "../../screens/userLoggedIn/userLoggedIn";
import { ApiToken } from "../../localStorage";
import { ExitOutline, ChevronBackOutline } from "react-ionicons";
import UserStatus from "../UserStatus/UserStatus";
import { timeSince } from "../../functions/time";
import ProfilePic from "../Utiles/ProfilePic/ProfilePic";

function NavBar(props: NavBarProps) {
  const user = useContext(UserContext);
  const signOut = props.handleSignOut;
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const changeStatus = async (status: string) => {
    if (!user) return;
    try {
      const response = await fetch(
        RESTAPIUri + "/user/" + user._id + "/changeStatus",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + ApiToken(),
          },
          body: JSON.stringify({ status: status }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const jsonData = await response.json();
      console.log(jsonData);
      user.status = jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  if (!user) return null;
  return (
    <div className="NavBar">
      {user.userName}
      <div className="navBar-right">
        <div className="navBar-right-btn">
          <div className="profile-pic-container">
            <ProfilePic props={user.photo} />
          </div>
          <div className="profile-dropdown-menu">
            <div className="user-profile-container">
              <div className="profile" onClick={() => console.log(user)}>
                <div className="user-profile-pic">
                  <div className="user-profile-pic-container">
                    {" "}
                    <ProfilePic props={user.photo} />
                  </div>
                </div>
                <div className="user-profile-info">
                  <div className="user-profile-name">{user.userName}</div>
                  <div className="user-profile-status">
                    {user.status === "Offline"
                      ? "En ligne il y a " + timeSince(new Date(user.lastSeen))
                      : user.status}
                  </div>
                </div>
              </div>
            </div>
            <div className="separator"></div>
            <ul>
              {" "}
              <li className="profile-dropdown-menu-options">
                <div className="options-icon">
                  <div style={{ height: "2rem", width: "2rem" }}>
                    {" "}
                    <ProfilePic props={user.photo} />
                  </div>
                </div>
                <div className="options-text">Changer de photo</div>
              </li>
              <li className="profile-dropdown-menu-options " id="status-title">
                <div className="options-icon">
                  <ChevronBackOutline height="1.5rem" width="1.5rem" />
                </div>
                <div className="options-text ">Changer de statut</div>
                <ul className="status-left-side-menu">
                  <li
                    className="status-options"
                    onClick={() => changeStatus("Online")}
                  >
                    <div className="options-icon">
                      <div className="status-container">
                        <UserStatus status={"Online"} />
                      </div>
                    </div>
                    <div className="options-text">En ligne</div>
                  </li>
                  <li
                    className="status-options"
                    onClick={() => changeStatus("Offline")}
                  >
                    <div className="options-icon">
                      <div className="status-container">
                        <UserStatus status={"Offline"} />
                      </div>
                    </div>
                    <div className="options-text">Hors ligne</div>
                  </li>
                  <li
                    className="status-options"
                    onClick={() => changeStatus("Busy")}
                  >
                    <div className="options-icon">
                      <div className="status-container">
                        <UserStatus status={"Busy"} />
                      </div>
                    </div>
                    <div className="options-text">Ne pas déranger</div>
                  </li>
                </ul>
              </li>
              <li className="profile-dropdown-menu-options" onClick={signOut}>
                <div className="options-icon">
                  <ExitOutline height="1.5rem" width="1.5rem" />
                </div>
                <div className="options-text">Sé déconnecter</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
