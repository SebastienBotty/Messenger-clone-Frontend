import { io } from "socket.io-client";
import { ApiToken } from "./localStorage";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
  auth: { token: ApiToken() },
});
