import { ApiToken } from "../localStorage";
import { ConversationType, MessageType } from "../typescript/types";
const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

export const postMessage = async (
  messageData: MessageType,
  conversationData?: ConversationType
) => {
  console.log("post message called");
  try {
    const response = await fetch(RESTAPIUri + "/message/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ApiToken(),
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error("Erreur lors du POST MEssage");
    }
    const jsonData = await response.json();
    console.log(jsonData);
    //console.log(displayedConv);
    //Reload the sideBar component to fetch the latest conversation
    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};
export const deleteMessageForUser = async (
  messageId: string | undefined,
  userId: string,
  username: string
): Promise<boolean> => {
  /*  console.log(messageId, userId, username);
  console.log(); */
  if (!messageId) return false;
  console.log(RESTAPIUri + "/message/userId/" + userId + "/markMessageAsDeletedByUser");
  try {
    const response = await fetch(
      RESTAPIUri + "/message/userId/" + userId + "/markMessageAsDeletedByUser",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ApiToken()}`,
        },
        body: JSON.stringify({
          messageId: messageId,
          username: username,
        }),
      }
    );
    //console.log("ALOALOALOALO");

    if (!response.ok) {
      console.log("ERREUR ICI");
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const data = await response.json();
    //console.log(data.message);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};

export const deleteMessageForEveryone = async (
  messageId: string | undefined,
  userId: string,
  username: string
): Promise<boolean> => {
  if (!messageId) return false;
  try {
    const response = await fetch(
      RESTAPIUri + "/message/userId/" + userId + "/markMessageAsDeletedForEveryone",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ApiToken()}`,
        },
        body: JSON.stringify({
          messageId: messageId,
          username: username,
        }),
      }
    );
    if (!response.ok) {
      console.log("ERREUR ICI");
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const data = await response.json();
    console.log(data.message);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};

export const transferMsg = async (message: MessageType, conversationIdTarget: string) => {};

export const changeMsgReaction = async (
  messageId: string,
  reaction: string,
  userId: string,
  username: string
): Promise<{ userId: string; reaction: string; username: string }[] | false> => {
  try {
    const response = await fetch(RESTAPIUri + "/message/changeReaction", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        messageId: messageId,
        reaction: reaction,
        userId: userId,
        username: username,
      }),
    });

    if (!response.ok) {
      console.log("ERREUR ICI");
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const jsonData = await response.json();
    console.log(jsonData);

    return jsonData.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};

export const removeMsgReaction = async (
  messageId: string,
  userId: string,
  username: string
): Promise<boolean> => {
  try {
    const response = await fetch(RESTAPIUri + "/message/removeReaction", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        messageId: messageId,
        userId: userId,
        username: username,
      }),
    });

    if (!response.ok) {
      console.log("ERREUR ICI");
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const jsonData = await response.json();
    console.log(jsonData);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};
