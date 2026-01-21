import React, { useState, useEffect } from "react";
import SignIn from "../../components/auth/signIn/signIn";
import SignUp from "../../components/auth/signUp/signUp";
import "./userNotLogged.css";
import { comptes } from "../../constants/testAccounts";
import LoadingSpinner from "../../components/Utiles/loadingSpinner/loadingSpinner";

function UserNotLogged() {
  const [activeTab, setActiveTab] = useState("signin");
  const [isBackendOn, setIsBackendOn] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [selectedUser, setSelectedUser] = useState({ selectedMail: "", selectedPassword: "" });

  const selectUser = (account: { username: string; password: string }) => {
    setSelectedUser({
      selectedMail: account.username,
      selectedPassword: account.password,
    });
  };
  
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let alertShown = false; 
  
    const loadBackend = async () => {
      try {
        const response = await fetch(backendUrl + "/pingTest");
  
        if (response.ok) {
          setIsBackendOn(true);
          clearInterval(intervalId);
        } else if (!alertShown) {
          alert("Due to free hosting backend, please wait for the green light to log in. It might take a few minutes");
          alertShown = true;
        }
      } catch {
        console.log("Backend still sleeping...");
        if (!alertShown) {
          alert("Due to free hosting backend, please wait for the green light to log in. It might take a few minutes");
          alertShown = true;
        }
      }
    };
  
    loadBackend();
    intervalId = setInterval(loadBackend, 20000);
  
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="auth-container">
      <div className="signal-light">
        <div className="light-dot" style={{ backgroundColor: isBackendOn ? "Green" : "" }}>{!isBackendOn && <LoadingSpinner/>}</div>
        <div className="light-text">{isBackendOn ? "ON" : "OFF"}</div>
      </div>
      <div className="auth-card">
        <div className="auth-slogan">
          <h1>Not Messenger</h1>
          <p>Works like messenger, looks like messenger but it's Not messenger</p>
        </div>
        <div className="auth-header">
          <div
            className={`auth-tab ${activeTab === "signin" ? "active" : ""}`}
            onClick={() => setActiveTab("signin")}
          >
            Connexion
          </div>
          <div
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Inscription
          </div>
        </div>
        <div className="auth-body">
          {activeTab === "signin" ? (
            <SignIn
              selectedMail={selectedUser.selectedMail}
              selectedPassword={selectedUser.selectedPassword}
            />
          ) : (
            <SignUp />
          )}
        </div>
      </div>
      <div className="accounts-list">
        <h4>Test accounts</h4>
        <table>
          <tr>
            <th>Mail</th>
            <th>Password</th>
          </tr>
          {comptes
            .sort((a, b) => a.username.localeCompare(b.username))
            .map((account) => (
              <tr onClick={() => selectUser(account)}>
                <td className="accounts-list-username">{account.username}</td>
                <td className="accounts-list-password">{account.password}</td>
              </tr>
            ))}
        </table>
      </div>
    </div>
  );
}

export default UserNotLogged;
