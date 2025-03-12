import React, { useState } from "react";
import SignIn from "../../components/auth/signIn/signIn";
import SignUp from "../../components/auth/signUp/signUp";
import "./userNotLogged.css";

function UserNotLogged() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="auth-container">
      <div className="auth-card">
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
        <div className="auth-body">{activeTab === "signin" ? <SignIn /> : <SignUp />}</div>
      </div>
    </div>
  );
}

export default UserNotLogged;
