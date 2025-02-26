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

  try {
    console.log("POST CONVERSATION FETCHING OK");
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
      console.log("erreur POST CONVERSATION");
      throw new Error(error.message);
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

export const isPrivateConvExisting = async (user: UserDataType, addedMembers: string[]) => {
  console.log("FETCHING IS PRIVATE CONV EXISTING");
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

export const patchConvName = async (
  conversationId: string,
  conversationName: string,
  userId: string
) => {
  try {
    const response = await fetch(RESTAPIUri + "/conversation/changeConversationName", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ApiToken(),
      },
      body: JSON.stringify({
        conversationId: conversationId,
        conversationName: conversationName,
        userId: userId,
        date: new Date(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const jsonData = await response.json();
    console.log(jsonData);
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

export const postConvPhoto = async (
  base64String: string,
  conversationId: string,
  userId: string
) => {
  try {
    const response = await fetch(`${RESTAPIUri}/conversation/changeConversationPhoto`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        conversationId: conversationId,
        photoStr: base64String,
        userId: userId,
        date: new Date(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Erreur inconnue");
    }
    return false;
  }
};

export const patchConvEmoji = async (emoji: string, conversationId: string, userId: string) => {
  try {
    const response = await fetch(`${RESTAPIUri}/conversation/changeEmoji`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        conversationId: conversationId,
        emoji: emoji,
        userId: userId,
        date: new Date(),
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("An unknown error occurred");
    }
    return false;
  }
};

export const patchConvNickname = async (
  conversationId: string,
  userId: string,
  userTargetId: string,
  nickname: string
) => {
  try {
    const response = await fetch(RESTAPIUri + "/conversation/changeNickname", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        conversationId: conversationId,
        userId: userId,
        userTargetId: userTargetId,
        nickname: nickname,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};
