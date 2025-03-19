import { ApiToken } from "../localStorage";
import { ConversationType, CustomizationType, UserDataType } from "../typescript/types";

const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

// ----------------------------------------------------------POST
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

//------------------------------------------GET-----------------------------------------
export const getConversations = async (userId: string): Promise<ConversationType[] | false> => {
  try {
    const response = await fetch(
      RESTAPIUri + "/conversation/userId/" + userId + "/getConversations",
      {
        method: "GET",
        headers: {
          "Application-type": "Application/json",
          Authorization: "Bearer " + ApiToken(),
        },
      }
    );

    if (!response.ok) {
      const errorMsg = await response.json();
      throw new Error("Erreur lors du fetch Conversations :" + errorMsg.message);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occured");
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

export const searchConversationWithUser = async (
  searchQuery: string,
  userId: string,
  username: string
): Promise<ConversationType[] | false> => {
  try {
    const response = await fetch(
      RESTAPIUri +
        "/conversation/userId/" +
        userId +
        "/conversationsWith?members=" +
        searchQuery +
        "&user=" +
        username,
      {
        headers: { authorization: `Bearer ${ApiToken()}` },
      }
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la recherche d'utilisateur");
    }
    const jsonData = await response.json();
    console.log("SEARCH VONERSATION ICI");
    console.log(jsonData);
    //setUsersPrediction(jsonData);
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
): Promise<
  | {
      conversation: ConversationType;
      customizationKey: keyof CustomizationType;
      customizationValue: string;
    }
  | false
> => {
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
): Promise<
  | {
      conversation: ConversationType;
      customizationKey: keyof CustomizationType;
      customizationValue: string;
    }
  | false
> => {
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

export const patchConvTheme = async (theme: string, conversationId: string, userId: string) => {
  try {
    const response = await fetch(`${RESTAPIUri}/conversation/changeTheme`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        conversationId: conversationId,
        theme,
        userId,
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

export const patchAddMembers = async (
  arrMembers: UserDataType[],
  conversationId: string | undefined,
  userUsername: string | undefined,
  userId: string | undefined
) => {
  console.log(arrMembers, conversationId, userUsername, userId);
  if (!conversationId || !userUsername || !userId || arrMembers.length < 1) return;
  try {
    const response = await fetch(RESTAPIUri + "/conversation/addMembers", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + ApiToken(),
      },
      body: JSON.stringify({
        addedUsers: arrMembers,
        conversationId: conversationId,
        adderUsername: userUsername,
        adderUserId: userId,
        date: new Date(),
      }),
    });

    if (!response.ok) {
      const jsonData = await response.json();
      throw new Error(jsonData.message);
    }
    const jsonData = await response.json();

    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
};

export const patchRemoveMember = async (
  conversationId: string,
  removerUsername: string,
  removerUserId: string,
  removedUsername: string
): Promise<false | { conversation: ConversationType; removedUsername: string }> => {
  try {
    const response = await fetch(RESTAPIUri + "/conversation/removeUser", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ApiToken(),
      },
      body: JSON.stringify({
        conversationId: conversationId,
        removerUsername: removerUsername,
        removerUserId: removerUserId,
        removedUsername: removedUsername,
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

export const patchUserAdmin = async (
  conversationId: string,
  targetUsername: string,
  userId: string,
  username: string,
  changeAdmin: boolean
): Promise<
  false | { conversation: ConversationType; targetUsername: string; changeAdmin: boolean }
> => {
  console.log("allo");
  console.log(conversationId, targetUsername, userId, username, changeAdmin);
  try {
    const response = await fetch(RESTAPIUri + "/conversation/changeAdmin", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + ApiToken(),
      },
      body: JSON.stringify({
        conversationId,
        targetUsername,
        userId,
        username,
        changeAdmin,
      }),
    });

    if (!response.ok) {
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const jsonData = await response.json();
    //console.log(jsonData);

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
