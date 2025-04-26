import { io } from "socket.io-client";
import { ApiToken } from "../localStorage";

export const socket = io(process.env.REACT_APP_BACKEND_URL || "", {
  autoConnect: false,
  //auth: { token: ApiToken() },
});
