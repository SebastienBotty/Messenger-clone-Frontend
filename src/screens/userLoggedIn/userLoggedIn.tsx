import React, { createContext, useState, useEffect, useContext } from "react";
import NavBar from "../../components/NavBar/NavBar";
import WindowConversation from "../../components/WindowConversation/WindowConversation";
import SideBarConversations from "../../components/SideBarConversations/SideBarConversations";
import ImageVizualizer from "../../components/ImageVizualizer/ImageVizualizer";
import {
  NavBarProps,
  ConversationType,
  ConversationContextType,
  UserDataType,
  MostRecentContextType,
  TriggerContextType,
  ShowImgVisualizerContextType,
  ImgVisualizerInitialImgType,
  ImgS3DataType,
  RecentConversationsContextType,
} from "../../typescript/types";
import { socket } from "../../socket";
import { useLocation } from "react-router-dom";
import { ApiToken } from "../../localStorage";

import "./userLoggedIn.css";

const DisplayedConvContext = createContext<ConversationContextType | undefined>(
  undefined
);
const MostRecentConvContext = createContext<MostRecentContextType | undefined>(
  undefined
);

const ShowImgVisualizerContext = createContext<
  ShowImgVisualizerContextType | undefined
>(undefined);

const ImgVisualizerInitialImgContext = createContext<
  ImgVisualizerInitialImgType | undefined
>(undefined);

const RecentConversationsContext = createContext<
  RecentConversationsContextType | undefined
>(undefined);

const TriggerContext = createContext<TriggerContextType | undefined>(undefined);
export const UserContext = createContext<UserDataType | null>(null);

function UserLoggedIn({ handleSignOut }: NavBarProps) {
  const location = useLocation();
  const user = location.state;
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const [displayedConv, setDisplayedConv] = useState<ConversationType | null>(
    null
  );
  const [mostRecentConv, setMostRecentConv] = useState<ConversationType | null>(
    null
  );
  const [trigger, setTrigger] = useState<boolean | null>(false);
  const [showImgVisualizer, setShowImgVisualizer] = useState<boolean | null>(
    false
  );
  const [imgData, setImgData] = useState<ImgS3DataType | null>(null);
  const [showConversationWindow, setShowConversationWindow] =
    useState<boolean>(false);

  const [recentConversations, setRecentConversations] = useState<
    ConversationType[] | null
  >(null);

  const patchSocketId = async (socketId: string | undefined) => {
    try {
      const response = await fetch(
        RESTAPIUri + "/user/userId/" + user?._id + "/socketId",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + ApiToken(),
          },
          body: JSON.stringify({ socketId: socketId }),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors du patch socketId");
      }
      const jsonData = await response.json();
      console.log("Socket Id de " + user?.userName + " : " + jsonData);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      patchSocketId(socket.id);
    });
    return () => {
      if (socket) {
        socket.off("connect");
        socket.disconnect();
      }
    };
  }, []);
  // When page loads, displayedConv is set to null, when it receives a data, it sets the state to true then shows the conversation window.
  useEffect(() => {
    if (displayedConv !== null) {
      setShowConversationWindow(true);
    }

    return () => {};
  }, [displayedConv]);

  return (
    <UserContext.Provider value={user}>
      <DisplayedConvContext.Provider
        value={{ displayedConv, setDisplayedConv }}
      >
        <RecentConversationsContext.Provider
          value={{ recentConversations, setRecentConversations }}
        >
          <ShowImgVisualizerContext.Provider
            value={{ showImgVisualizer, setShowImgVisualizer }}
          >
            <ImgVisualizerInitialImgContext.Provider
              value={{ imgData, setImgData }}
            >
              <MostRecentConvContext.Provider
                value={{ mostRecentConv, setMostRecentConv }}
              >
                <div className="userLoggedIn">
                  {showImgVisualizer && <ImageVizualizer />}
                  <div className="page-header">
                    {" "}
                    <NavBar handleSignOut={handleSignOut} />
                  </div>
                  <div className="content">
                    <TriggerContext.Provider value={{ trigger, setTrigger }}>
                      <SideBarConversations
                        setShowConversationWindow={setShowConversationWindow}
                      />

                      {showConversationWindow && <WindowConversation />}
                    </TriggerContext.Provider>
                  </div>
                </div>
              </MostRecentConvContext.Provider>
            </ImgVisualizerInitialImgContext.Provider>
          </ShowImgVisualizerContext.Provider>
        </RecentConversationsContext.Provider>
      </DisplayedConvContext.Provider>
    </UserContext.Provider>
  );
}
export const useDisplayedConvContext = () => {
  const context = useContext(DisplayedConvContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
export default UserLoggedIn;

export const useMostRecentConvContext = () => {
  const context = useContext(MostRecentConvContext);
  if (context === undefined) {
    throw new Error(
      "useMostRecentConvContext must be used within a MyProvider"
    );
  }
  return context;
};

export const useTriggerContext = () => {
  const context = useContext(TriggerContext);
  if (context === undefined) {
    throw new Error("userTriggerContext must be used within a MyProvider");
  }
  return context;
};

export const useImgVisualizerInitialImgContext = () => {
  const context = useContext(ImgVisualizerInitialImgContext);
  if (context === undefined) {
    throw new Error(
      "useImgVisualizerInitialImgContext must be used within a MyProvider "
    );
  }
  return context;
};

export const useShowImgVisualizerContext = () => {
  const context = useContext(ShowImgVisualizerContext);
  if (context === undefined) {
    throw new Error(
      "useShowImgVisualizerContext must be used within a MyProvider "
    );
  }
  return context;
};

export const useRecentConversationContext = () => {
  const context = useContext(RecentConversationsContext);
  if (context === undefined) {
    throw new Error(
      "useShowImgVisualizerContext must be used within a MyProvider "
    );
  }
  return context;
};
