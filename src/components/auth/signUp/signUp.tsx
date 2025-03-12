import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import "./signUp.css";

function SignUp() {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(false);

  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  // Vérifier si les mots de passe correspondent
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [password, confirmPassword]);

  const createUserinDb = async () => {
    const postData = {
      mail: email,
      userName: userName,
    };
    try {
      const response = await fetch(RESTAPIUri + "/user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const jsonData = await response.json();
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Une erreur inconnue s'est produite");
      }
    }
  };

  const createUserFireBase = async (): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      return true;
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "Une erreur s'est produite lors de la création du compte";

      if (errorCode === "auth/email-already-in-use") {
        errorMessage = "Cet email est déjà utilisé";
      } else if (errorCode === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible";
      }

      throw new Error(errorMessage);
    }
  };

  const checkEmail = async () => {
    try {
      const response = await fetch(RESTAPIUri + "/user/checkMail/" + email);
      if (!response.ok) {
        throw new Error("Erreur lors de la vérification de l'email");
      }
      const jsonData = await response.json();
      return jsonData.mailExists;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Une erreur inconnue s'est produite");
      }
    }
  };

  const checkUserName = async () => {
    try {
      const response = await fetch(RESTAPIUri + "/user/checkUserName/" + userName);
      if (!response.ok) {
        throw new Error("Erreur lors de la vérification du nom d'utilisateur");
      }
      const jsonData = await response.json();
      return jsonData.userExists === true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Une erreur inconnue s'est produite");
      }
    }
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Vérification des mots de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const isMailExisting = await checkEmail();
      const isUserExisting = await checkUserName();

      if (isMailExisting) {
        setError("Cet email est déjà utilisé");
      } else if (isUserExisting) {
        setError("Ce nom d'utilisateur est déjà utilisé");
      } else {
        await createUserinDb();
        await createUserFireBase();
        setSuccess(true);
        setUserName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur inconnue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={(e) => signUp(e)}>
      <h2 className="auth-title">Créer un compte</h2>
      <p className="auth-subtitle">Rejoignez notre communauté</p>

      <div className="form-group">
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          id="username"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="signup-password">Mot de passe</label>
        <div className="password-input-container">
          <input
            id="signup-password"
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

      <div className="form-group">
        <label htmlFor="confirm-password">Confirmer le mot de passe</label>
        <div className="password-input-container">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={confirmPassword ? (passwordsMatch ? "match" : "no-match") : ""}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "Cacher" : "Voir"}
          </button>
        </div>
        {confirmPassword && (
          <div className={`password-match-indicator ${passwordsMatch ? "match" : "no-match"}`}>
            {passwordsMatch
              ? "Les mots de passe correspondent"
              : "Les mots de passe ne correspondent pas"}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Compte créé avec succès!</div>}

      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? "Création en cours..." : "S'inscrire"}
      </button>
    </form>
  );
}

export default SignUp;
