import "./App.css";
import React, { useState, useLayoutEffect, useContext } from "react";
import { socket } from "./socket";
import { auth } from "./firebase";
import { User } from "firebase/auth";

import SignIn from "./components/auth/signIn/signIn";
import NavBar from "./components/NavBar/NavBar";
import SideBarConversations from "./components/SideBarConversations/SideBarConversations";
import WindowConversation from "./components/WindowConversation/WindowConversation";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  socket.on("connect", () => console.log("connecté"));

  useLayoutEffect(() => {
    const authSubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsAuthChecked(true);
      console.log(user);
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
      {user ? (
        <div className="App">
          <NavBar handleSignOut={handleSignOut} />
          <div className="content">
            <SideBarConversations />
            <WindowConversation />
          </div>
        </div>
      ) : (
        <SignIn />
      )}
    </>
  );
}

export default App;
