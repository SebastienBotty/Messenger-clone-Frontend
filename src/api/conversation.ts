import { ApiToken } from "../localStorage";
import { UserDataType } from "../typescript/types";
import { postMessage } from "./message";

const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

export const postConversation = async (
  user: UserDataType,
  addedMembers: string[],
  inputMessage: string
) => {
  const postData = {
    members: [user.userName, ...addedMembers],
    admin: user.userName,
    creationDate: new Date(),
  };
  console.log(postData);
  try {
    console.log("ICI OK");
    const response = await fetch(RESTAPIUri + "/conversation/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      const error = await response.json();
      console.log("erreur ici");
      throw new Error(error.message);
    }
    const jsonData = await response.json();
    console.log(jsonData);
    const messageData = {
      author: user.userName,
      authorId: user._id,
      text: [inputMessage],
      seenBy: [user.userName],
      date: new Date(),
      conversationId: jsonData._id,
      responseToMsgId: null,
    };
    //console.log(" CONVERSATION DANS POST CONVERSATION");
    //console.log(jsonData);
    postMessage(messageData, jsonData);
    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      //console.log(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};

export const isPrivateConvExisting = async (user: UserDataType, addedMembers: string[]) => {
  try {
    const response = await fetch(
      RESTAPIUri +
        "/conversation/userId/" +
        user?._id +
        "/privateConversation?username=" +
        user?.userName +
        "&recipient=" +
        addedMembers[0],
      {
        headers: { authorization: `Bearer ${ApiToken()}` },
      }
    );
    if (!response.ok) {
      throw new Error("Erreur de la vérif isPrivateConvExisting");
    }

    const jsonData = await response.json();
    console.log(jsonData);
    return jsonData ? jsonData : false;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
};
export const leaveConv = async (
  conversationId: string,
  username: string,
  userId: string
): Promise<false | string[]> => {
  try {
    const response = await fetch(RESTAPIUri + "/conversation/leaveConversation", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ApiToken(),
      },
      body: JSON.stringify({
        conversationId: conversationId,
        username: username,
        userId: userId,
        date: new Date(),
      }),
    });
    if (!response.ok) {
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const jsonData = await response.json();
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

export const unmuteConversation = async (conversationId: string, userId: string) => {
  try {
    const response = await fetch(RESTAPIUri + "/user/userId/" + userId + "/unmuteConversation", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        conversationId: conversationId,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    //console.log("conversation unmuted");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};
