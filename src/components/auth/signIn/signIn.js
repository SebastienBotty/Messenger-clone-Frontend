import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";

import "./signIn.css";

function SignIn() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const checkEmail = async () => {
    try {
      const response = await fetch(RESTAPIUri + "/user/checkMail/" + email);
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche de données");
      }
      const jsonData = await response.json();
      console.log("Mail : " + jsonData.mailExists);
      return jsonData.mailExists;
    } catch (error) {
      console.error(error.message);
      return true; //if there is an error, returns true to be sure user can't use this mail in case it is only used but there was an error
    }
  };
  const signIn = async (e) => {
    e.preventDefault();
    try {
      const isMailExisting = checkEmail();
      if (isMailExisting) {
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
      }
    } catch (error) {
      console.error(error.message);
    }
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
