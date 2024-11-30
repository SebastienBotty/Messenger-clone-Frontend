import { ApiToken } from "../localStorage";
import { ConversationType, UserDataType } from "../typescript/types";

const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

export const leaveConv = async (
  conversationId: string,
  username: string,
  userId: string
): Promise<false | string[]> => {
  try {
    const response = await fetch(
      RESTAPIUri + "/conversation/leaveConversation",
      {
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
      }
    );
    if (!response.ok) {
      const errorMsg = await response.json();
      throw new Error(errorMsg.message);
    }
    const jsonData = await response.json();
    //console.log(jsonData.members);
    return jsonData.members;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};

export const unmuteConversation = async (
  conversation: ConversationType,
  user: UserDataType
) => {
  if (!user) return;
  try {
    const response = await fetch(
      RESTAPIUri + "/user/userId/" + user._id + "/unmuteConversation",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${ApiToken()}`,
        },
        body: JSON.stringify({
          conversationId: conversation._id,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    console.log("conversation unmuted");
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
