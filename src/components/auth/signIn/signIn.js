import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";

import "./signIn.css";

function SignIn() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const signIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  };
  return (
    <div className="signin">
      <form className="signin-form" onSubmit={(e) => signIn(e)}>
        <h1> Authentification requise</h1>
        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        ></input>
        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          required
        ></input>
        <button type="sumbit"> Connecter</button>
      </form>
    </div>
  );
}

export default SignIn;
