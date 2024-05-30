import "./App.css";
import React, { useState, useLayoutEffect, createContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { User } from "firebase/auth";
import { UserDataType } from "./typescript/types";

import UserLoggedIn from "./screens/userLoggedIn/userLoggedIn";
import UserNotLogged from "./screens/userNotLogged/userNotLogged";

export const UserContext = createContext<UserDataType | null>(null);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const navigate = useNavigate();
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  useLayoutEffect(() => {
    const fetchUserData = async (firebaseUser: User) => {
      console.log("USER");
      console.log(firebaseUser);
      console.log(firebaseUser.email);
      try {
        const response = await fetch(
          RESTAPIUri + "/user/mail/" + firebaseUser.email
        );
        if (!response.ok) {
          throw new Error("Erreur lors du fetch");
        }
        const jsonData = await response.json();
        console.log("JSON DATA SET ");
        console.log(jsonData);
        setUserData(jsonData);
        navigate("/MyMessages", { state: jsonData });
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
      } else {
        setUserData(null);
        navigate("/");
      }
    });

    return () => authSubscribe();
  }, []);

  const handleSignOut = (): void => {
    auth.signOut();
  };

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
