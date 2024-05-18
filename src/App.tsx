import "./App.css";
import { socket } from "./socket";
import NavBar from "./components/NavBar/NavBar";
import SideBarConversations from "./components/SideBarConversations/SideBarConversations";
import WindowConversation from "./components/WindowConversation/WindowConversation";

function App() {
  socket.on("connect", () => console.log("connecté"));
  return (
    <div className="App">
      <NavBar />
      <div className="content">
        <SideBarConversations />
        <WindowConversation />
      </div>
    </div>
  );
}

export default App;
