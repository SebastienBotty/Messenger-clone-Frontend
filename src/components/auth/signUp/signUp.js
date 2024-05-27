import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";

function SignUp() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const createUserinDb = async () => {
    const postData = {
      mail: email,
      userName: userName,
    };
    try {
      const response = fetch(RESTAPIUri + "/user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
    } catch (error) {
      console.error(error.message);
    }
  };
  const createUserFireBase = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        // ...
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.error(errorCode, errorMessage);
      });
  };

  // Check if mail already exists in DB
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

  const checkUserName = async () => {
    try {
      const response = await fetch(
        RESTAPIUri + "/user/checkUserName/" + userName
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche de données");
      }
      const jsonData = await response.json();
      console.log("Username : " + jsonData.userExists);
      return jsonData.userExists === true;
    } catch (error) {
      console.error(error.message);
      return true; //if there is an error, returns true to be sure user can't use this mail in case it is only used but there was an error
    }
  };

  const signUp = async (e) => {
    e.preventDefault();

    try {
      const isMailExisting = await checkEmail();
      const isUserExisting = await checkUserName();
      if (isMailExisting || isUserExisting) {
        console.log("Mail ou username déja utilisé");
      } else {
        createUserFireBase();
        createUserinDb();
        console.log("user Created");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email", error);
    }
  };
  return (
    <div className="signin-form">
      <form onSubmit={(e) => signUp(e)}>
        <input
          type="mail"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        ></input>
        <button type="sumbit"> Connecter</button>
      </form>
    </div>
  );
}

export default SignUp;
