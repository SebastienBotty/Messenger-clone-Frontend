import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAss9AGMDQvRPxr17Mwapvv9nqq0LgXK98",
  authDomain: "messenger-clone-50216.firebaseapp.com",
  projectId: "messenger-clone-50216",
  storageBucket: "messenger-clone-50216.appspot.com",
  messagingSenderId: "407602534299",
  appId: "1:407602534299:web:4a279e80bc8ccb98daf33e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
