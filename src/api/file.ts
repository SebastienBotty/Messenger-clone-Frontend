import { ApiToken } from "../localStorage";
import { MessageType } from "../typescript/types";

const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

//---------------------------------------------------POST

//Post a file in a conversation
export const uploadFiles = async (droppedFiles: File[], conversationId: string) => {
  if (droppedFiles.length < 1) {
    return;
  }
  const filesFormData = new FormData();
  for (const file of droppedFiles) {
    console.log("append");
    filesFormData.append("files", file);
    console.log(file);
  }
  //console.log(droppedFiles);
  //console.log(filesFormData);

  try {
    const response = await fetch(RESTAPIUri + "/file/upload/" + conversationId, {
      method: "POST",

      headers: {
        authorization: `Bearer ${ApiToken()}`,
      },
      body: filesFormData,
    });
    if (!response.ok) {
      throw new Error("Error uploading files");
    }
    const data = await response.json();
    //console.log(data);

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

// Trasnfer a file from a conversation to another

interface TransferImageT {
  userId: string;
  sender: string;
  targetConversationId: string;
  fileUrl: string;
  date: Date;
}
export const postTransferImage = async (postData: TransferImageT): Promise<MessageType | false> => {
  try {
    const response = await fetch(
      RESTAPIUri + "/file/userId/" + postData.userId + "/transferImage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${ApiToken()}`,
        },
        body: JSON.stringify(postData),
      }
    );

    if (!response.ok) {
      console.log(response.statusText);
      throw new Error(response.statusText);
    }

    console.log("msg envoyé");
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
