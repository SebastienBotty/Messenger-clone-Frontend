import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
