import "./App.css";
import React, { useState, useLayoutEffect, createContext } from "react";
import { auth } from "./firebase";
import { User } from "firebase/auth";

import UserLoggedIn from "./screens/userLoggedIn/userLoggedIn";
import UserNotLogged from "./screens/userNotLogged/userNotLogged";

export const UserContext = createContext<User | null>(null);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useLayoutEffect(() => {
    const authSubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsAuthChecked(true);
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
        <UserContext.Provider value={user}>
          <UserLoggedIn handleSignOut={handleSignOut} />
        </UserContext.Provider>
      ) : (
        <UserNotLogged />
      )}
    </>
  );
}

export default App;
