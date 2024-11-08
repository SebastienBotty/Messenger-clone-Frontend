import "./App.css";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { User } from "firebase/auth";

import UserLoggedIn from "./screens/userLoggedIn/userLoggedIn";
import UserNotLogged from "./screens/userNotLogged/userNotLogged";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const navigate = useNavigate();
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  useLayoutEffect(() => {
    const fetchUserData = async (firebaseUser: User) => {
      //console.log("USER");
      //console.log(firebaseUser);
      //console.log(firebaseUser.email);
      try {
        const response = await fetch(
          RESTAPIUri + "/user/mail/" + firebaseUser.email
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        const jsonData = await response.json();
        //console.log("JSON DATA SET ");
        //console.log(jsonData);
        localStorage.setItem("ApiToken", JSON.stringify(jsonData[1].ApiToken));
        //console.log(localStorage.getItem("ApiToken"));
        navigate("/MyMessages", { state: jsonData[0] });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };
    const authSubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsAuthChecked(true);
      /*  console.log("statue user ----------------------");
      console.log(user); */
      if (user !== null) {
        fetchUserData(user);
        //console.log(user);
      } else {
        navigate("/");
      }
    });

    return () => authSubscribe();
  }, []);

  const handleSignOut = (): void => {
    auth.signOut();
  };

  useEffect(() => {
    document.title = "!Messenger";

    return () => {};
  }, []);

  if (!isAuthChecked) {
    // La vérification de la connexion n'est pas encore terminée
    return null; // Ou un composant de chargement/spinner
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<UserNotLogged />}></Route>
        <Route
          path="/MyMessages"
          element={<UserLoggedIn handleSignOut={handleSignOut} />}
        />
      </Routes>
    </>
  );
}

export default App;
