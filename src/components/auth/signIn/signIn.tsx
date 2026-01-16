import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import "./signIn.css";

function SignIn(user: { selectedMail: string; selectedPassword: string }) {
  const [email, setEmail] = useState(user.selectedMail);
  const [password, setPassword] = useState(user.selectedPassword);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const checkEmail = async () => {
    try {
      const response = await fetch(RESTAPIUri + "/user/checkMail/" + email);
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche de données");
      }
      const jsonData = await response.json();
      return jsonData.mailExists;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
      return true;
    }
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isMailExisting = await checkEmail();
      if (isMailExisting) {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            let errorMessage = "Une erreur s'est produite";

            if (errorCode === "auth/wrong-password") {
              errorMessage = "Mot de passe ou mail incorrect";
            } else if (errorCode === "auth/user-not-found") {
              errorMessage = "Mot de passe ou mail incorrect";
            } else if (errorCode === "auth/too-many-requests") {
              errorMessage = "Trop de tentatives, veuillez réessayer plus tard";
            }

            setError(errorMessage);
          });
      } else {
        setError("Aucun compte associé à cet email");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur inconnue s'est produite");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    setEmail(user.selectedMail);
    setPassword(user.selectedPassword);
  }, [user.selectedMail, user.selectedPassword]);

  return (
    <form className="auth-form" onSubmit={(e) => signIn(e)}>
      <h2 className="auth-title">Bienvenue</h2>
      <p className="auth-subtitle">Connectez-vous à votre compte</p>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <div className="password-input-container">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Cacher" : "Voir"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? "Connexion en cours..." : "Se connecter"}
      </button>

      <div className="auth-footer">
        <a href="#" className="forgot-password" onClick={() => alert("Not implemented")}>
          Mot de passe oublié?
        </a>
      </div>
    </form>
  );
}

export default SignIn;
