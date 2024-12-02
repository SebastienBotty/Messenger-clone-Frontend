import { ApiToken } from "../localStorage";

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
