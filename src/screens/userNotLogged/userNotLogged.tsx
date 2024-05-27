import React from "react";
import SignIn from "../../components/auth/signIn/signIn";
import SignUp from "../../components/auth/signUp/signUp";

function UserNotLogged() {
  return (
    <div>
      <SignIn />
      <SignUp />
    </div>
  );
}

export default UserNotLogged;
