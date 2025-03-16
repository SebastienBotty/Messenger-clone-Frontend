import { ApiToken } from "../localStorage";
import { MessageType, ThumbnailsImgType } from "../typescript/types";

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

export const postProfilePic = async (
  file: File,
  userId: string
): Promise<{ image: string } | false> => {
  try {
    const formData = new FormData();
    formData.append("profilePic", file);
    console.log("allo");
    const response = await fetch(RESTAPIUri + "/file/profilePic/" + userId, {
      method: "POST",
      headers: {
        authorization: "Bearer " + ApiToken(),
      },
      body: formData,
    });
    console.log("iciii");
    if (!response.ok) {
      const error = await response.json();
      console.log("erreur");
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

//---------------------------------------GET-------------------------------

export const fetchConvImages = async (
  userId: string,
  conversationId: string,
  filename: string
): Promise<ThumbnailsImgType[] | false> => {
  try {
    const response = await fetch(
      RESTAPIUri +
        "/file/UserId/" +
        userId +
        "/conversationId/" +
        conversationId +
        "/getConversationImages?fileName=" +
        filename,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + ApiToken(),
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
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

interface FileData {
  fileName: string;
  type: string;
  url: string;
}

export const fetchFilesData = async (
  fileNamesStr: string,
  conversationId: string
): Promise<FileData[] | false> => {
  try {
    const response = await fetch(
      RESTAPIUri + "/file/conversationId/" + conversationId + "/getFiles?fileNames=" + fileNamesStr,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + ApiToken(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const JSONData = await response.json();

    return JSONData.files;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return false;
  }
};

export const getOlderFiles = async (userId: string, conversationId: string, fileName: string) => {
  console.log(
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  );
  console.log(userId, conversationId, fileName);
  try {
    const response = await fetch(
      `${RESTAPIUri}/file/userId/${userId}/conversationId/${conversationId}/getOlderFiles?fileName=${encodeURIComponent(
        fileName
      )}`,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + ApiToken(),
          "Content-Type": "application/json",
        },
      }
    );

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
