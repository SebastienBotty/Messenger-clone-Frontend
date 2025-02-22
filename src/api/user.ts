import { ApiToken } from "../localStorage";
import { ConversationType, UserDataType } from "../typescript/types";

const REST_API_URI = process.env.REACT_APP_REST_API_URI;
export const deleteConversation = async (
  conversationId: string,
  userId: string,
  callback: () => void
) => {
  try {
    const response = await fetch(REST_API_URI + "/user/userId/" + userId + "/deleteConversation", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${ApiToken()}`,
      },
      body: JSON.stringify({
        conversationId: conversationId,
        userId: userId,
        deleteDate: new Date(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    console.log("conversation deleted");
    callback();
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

export const getUsersSocket = async (
  conversation: ConversationType | null,
  user: UserDataType | null
) => {
  const convMembersStr = conversation?.members
    ?.filter((member) => member.username !== user?.userName)
    .map((member) => member.username)
    .join("-");
  try {
    const response = await fetch(REST_API_URI + "/user/getSockets?convMembers=" + convMembersStr, {
      headers: {
        Authorization: "Bearer " + ApiToken(),
      },
    });
    const jsonData = await response.json();
    //console.log("ICI SOCKET");
    //console.log(jsonData);

    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
};
