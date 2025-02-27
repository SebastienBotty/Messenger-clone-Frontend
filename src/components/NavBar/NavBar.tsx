import React, { useRef } from "react";
import "./NavBar.css";
import { NavBarProps } from "../../typescript/types";
import { useUserContext } from "../../constants/context";
import { ApiToken } from "../../localStorage";
import { ExitOutline } from "react-ionicons";
import UserStatus from "../UserStatus/UserStatus";
import { timeSince } from "../../functions/time";
import ProfilePic from "../Utiles/ProfilePic/ProfilePic";
import { socket } from "../../Sockets/socket";
import { statusTranslate } from "../../constants/status";

function NavBar(props: NavBarProps) {
  const { user, setUser } = useUserContext();
  const signOut = props.handleSignOut;
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const changeStatus = async (status: string) => {
    if (!user || status === user.status) return;
    try {
      const response = await fetch(RESTAPIUri + "/user/" + user._id + "/changeStatus", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + ApiToken(),
        },
        body: JSON.stringify({ status: status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const jsonData = await response.json();
      console.log(jsonData);

      setUser({
        ...user,
        status: jsonData.status,
        lastSeen: jsonData.lastSeen,
      });
      socket.emit("changeStatus", {
        userId: user._id,
        username: user.userName,
        status: jsonData.status,
        lastSeen: jsonData.lastSeen,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const focusProfilePicinput = () => {
    if (profilePicInputRef.current) {
      profilePicInputRef.current.click();
    }
  };
  const changeProfilePic = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        profilePicInputRef.current!.value = "";
        alert("La taille de l'image ne doit pas depasser 2 Mo.");
        return;
      }
      postProfilePic(file);
    } else {
      console.log("no file");
    }
  };

  const postProfilePic = async (file: File) => {
    if (!user || !file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    console.log("allo");
    try {
      const response = await fetch(RESTAPIUri + "/file/profilePic/" + user._id, {
        method: "POST",
        headers: {
          authorization: "Bearer " + ApiToken(),
        },
        body: formData,
      });
      console.log("iciii");
      if (!response.ok) {
        const error = await response.json();
        console.log("erreur");
        throw new Error(error.message);
      }
      console.log("okokk");
      const jsonData = await response.json();
      console.log("papapapap");
      console.log(jsonData);
      setUser({
        ...user,
        photo: jsonData.image,
      });
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
      <input
        type="file"
        className=" profile-pic-input"
        name="profile-pic-input"
        id="profile-pic-input"
        ref={profilePicInputRef}
        multiple={false}
        accept=".jpg, .jpeg, .png"
        onChange={changeProfilePic}
      />
      {user.userName}
      <div className="navBar-right">
        <div className="navBar-right-btn">
          <div className="profile-pic-container">
            <ProfilePic
              picSrc={user.photo}
              status={user.status}
              isOnline={user.isOnline}
              isGroupConversationPic={false}
            />
            <div className="profile-dropdown-menu">
              <div className="user-profile-container">
                <div className="profile" onClick={() => console.log(user)}>
                  <div className="user-profile-pic">
                    <div
                      className="user-profile-pic-container"
                      onClick={() => focusProfilePicinput()}
                    >
                      {" "}
                      <ProfilePic
                        picSrc={user.photo}
                        status={user.status}
                        isOnline={user.isOnline}
                        isGroupConversationPic={false}
                      />
                    </div>
                  </div>
                  <div className="user-profile-info">
                    <div className="user-profile-name">{user.userName}</div>
                    <div className="user-profile-status">
                      {user.status === "Offline"
                        ? "En ligne il y a " + timeSince(new Date(user.lastSeen))
                        : statusTranslate(user.status)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="separator"></div>
              <ul>
                {" "}
                <li className="profile-dropdown-menu-options " id="status-title">
                  <div className="options-icon">
                    <div id="profile-pic-status-container">
                      {" "}
                      <ProfilePic
                        picSrc={user.photo}
                        status={user.status}
                        isOnline={user.isOnline}
                        isGroupConversationPic={false}
                      />
                    </div>
                  </div>
                  <div className="options-text ">Changer de statut</div>
                  <ul className="status-left-side-menu">
                    <li className="status-options" onClick={() => changeStatus("Online")}>
                      <div className="options-icon">
                        <div className="status-container">
                          <UserStatus status={"Online"} />
                        </div>
                      </div>
                      <div className="options-text">En ligne</div>
                    </li>
                    <li className="status-options" onClick={() => changeStatus("Busy")}>
                      <div className="options-icon">
                        <div className="status-container">
                          <UserStatus status={"Busy"} />
                        </div>
                      </div>
                      <div className="options-text">Ne pas déranger</div>
                    </li>{" "}
                    <li className="status-options" onClick={() => changeStatus("Offline")}>
                      <div className="options-icon">
                        <div className="status-container">
                          <UserStatus status={"Offline"} />
                        </div>
                      </div>
                      <div className="options-text">Hors ligne</div>
                    </li>
                  </ul>
                </li>
                <li className="profile-dropdown-menu-options" onClick={signOut}>
                  <div className="options-icon">
                    <ExitOutline height="75%" width="75%" />
                  </div>
                  <div className="options-text">Sé déconnecter</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
