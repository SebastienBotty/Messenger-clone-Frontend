import React, { useState, useRef, useCallback, useEffect } from "react";
import { AddCircle, Close, ImagesOutline, Send } from "react-ionicons";
import { useMessagesContext, useUserContext } from "../../../../constants/context";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
  useTriggerContext,
} from "../../../../screens/userLoggedIn/userLoggedIn";
import GifPicker, { TenorImage } from "gif-picker-react";
import { ConversationType, MessageType } from "../../../../typescript/types";
import { ApiToken } from "../../../../localStorage";
import { getUsersSocket } from "../../../../api/user";
import { socket } from "../../../../Sockets/socket";
import { calculateTotalSize, formatFileSize } from "../../../../functions/file";

function NormalFooter({
  setShowDragOverOverlay,
  droppedFiles,
  setDroppedFiles,
}: {
  setShowDragOverOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  droppedFiles: File[];
  setDroppedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const { user } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const inputMessageRef = useRef<HTMLTextAreaElement>(null);

  const { messages, setMessages } = useMessagesContext();
  const { trigger, setTrigger } = useTriggerContext();
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();

  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // Limite de 25 Mo en octets
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [showGifPicker, setShowGifPicker] = useState<boolean>(false);
  const gifPickerRef = useRef<HTMLDivElement>(null);

  const emitMsgToSocket = (
    messageData: MessageType,
    convMembersSocket: Promise<any>,
    conversation: ConversationType | null
  ) => {
    const socketData =
      conversation == displayedConv
        ? [convMembersSocket, messageData, conversation, messages[messages.length - 1]]
        : [convMembersSocket, messageData, conversation];
    //console.log(messages[messages.length - 1]);
    //console.log(socketData);
    socket.emit("message", socketData);
    console.log("EMITTING  MESSAGE ICIIIIIIIIIIIIIIII");
  };

  const emitUserWrittingToSocket = async (isWriting: boolean) => {
    if (displayedConv) {
      const convMembersSocket = await getUsersSocket(displayedConv, user);
      const socketData = [convMembersSocket, isWriting, user?.userName, displayedConv];
      socket.emit("typing", socketData);
    }
  };

  const sendMessage = (fileNames?: string[]) => {
    const trimmedString = inputMessage.replace(/^\s+|\s+$/g, "");

    const messageData = {
      author: user?.userName,
      authorId: user?._id,

      text: fileNames
        ? ["PATHIMAGE/" + displayedConv?._id + ":" + fileNames.map((name) => name).join(",")]
        : [trimmedString],
      seenBy: [user?.userName],
      date: new Date(),
      conversationId: displayedConv?._id,
    };
    //console.log("iciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    //console.log(messageData.text);
    setInputMessage("");

    postMessage(messageData);
  };
  const postMessage = async (messageData: MessageType, conversationData?: ConversationType) => {
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
      //console.log(jsonData);
      //console.log(displayedConv);
      setMessages((prev) => [...prev, jsonData]); //--------------------------------------------------------------------------!!!!!!!!!!!!!!!!!
      //Reload the sideBar component to fetch the latest conversation
      setTrigger(!trigger);
      if (conversationData) {
        setMostRecentConv(conversationData);
        emitMsgToSocket(jsonData, await getUsersSocket(conversationData, user), conversationData);
      } else {
        setMostRecentConv(displayedConv);
        emitMsgToSocket(jsonData, await getUsersSocket(displayedConv, user), displayedConv);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const checkFiles = (files: File[]) => {
    const badFileNames: string[] = [];
    const alreadyDroppedFiles: string[] = [];
    for (const file of files) {
      if (file.name.includes(",") || file.name.includes("-")) {
        badFileNames.push(file.name);
        setShowDragOverOverlay(false);
        continue;
      }

      if (droppedFiles.some((f) => f.name === file.name)) {
        setShowDragOverOverlay(false);
        alreadyDroppedFiles.push(file.name);
        continue;
      }

      const totalSize = calculateTotalSize([...droppedFiles, file]);
      //console.log(totalSize);
      //console.log(MAX_FILE_SIZE_BYTES);

      if (totalSize <= MAX_FILE_SIZE_BYTES) {
        setDroppedFiles((prevFiles) => [...prevFiles, file]);
        setShowDragOverOverlay(false);
      } else {
        alert(
          "Le poids total des fichiers excède la limite de " +
            MAX_FILE_SIZE_BYTES / 1024 / 1024 +
            " Mo.\n Poids actuel : " +
            formatFileSize(totalSize) +
            ".\n " +
            file.name +
            " : " +
            formatFileSize(file.size)
        );
        setShowDragOverOverlay(false);
      }
    }
    if (inputFileRef.current) {
      inputFileRef.current.value = ""; // Reset le champ de saisi
    }
    if (badFileNames.length > 0) {
      alert(
        "Veuillez ne pas utiliser de virgule ni de tiret dans le nom du fichier: \n " +
          badFileNames.join("\n")
      );
    }
    if (alreadyDroppedFiles.length > 0) {
      alert(
        "Le(s) fichier(s) suivant(s) est(sont) déjà dans la liste: \n " +
          alreadyDroppedFiles.join("\n")
      );
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArr = Array.from(files);
      checkFiles(filesArr);
    }
  };
  const openFileInput = (e: React.MouseEvent) => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleGifPickerContainerClick = (event: MouseEvent) => {
    if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node)) {
      setShowGifPicker(false);
    }
  };
  const handleGifClick = (gif: TenorImage) => {
    if (!user || !displayedConv) return;
    console.log(gif);
    setShowGifPicker(false);

    const messageData = {
      author: user.userName,
      authorId: user._id,
      text: ["GIF/" + displayedConv._id + ":" + gif.preview.url],
      seenBy: [user.userName],
      date: new Date(),
      conversationId: displayedConv._id,
    };

    postMessage(messageData);
  };
  const deleteSelectedFile = (index: number) => {
    setDroppedFiles((prev) => prev.filter((_, i) => i !== index));
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && inputMessage.trim() != "" && !event.shiftKey) {
      event.preventDefault();
      if (displayedConv) {
        sendMessage();
      }
    }
  };

  const filePreview = () => {
    return (
      <div className="file-preview-container">
        {droppedFiles.map((file, index) => (
          <div key={index} className="file-preview-item">
            <div className="delete-file" onClick={() => deleteSelectedFile(index)}>
              <Close color={"red"} title={"Supprimer"} height="1.5rem" width="1.5rem" />
            </div>
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${file.name}`}
                className="file-preview-image"
              />
            ) : (
              <div className="file-icon">
                <img src="/file-icon.png" alt={`File Icon`} className="file-icon-img" />
                <div className="file-name">{file.name}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const uploadFiles = async () => {
    if (droppedFiles.length < 1) {
      return;
    }
    const filesFormData = new FormData();
    for (const file of droppedFiles) {
      filesFormData.append("files", file);
    }
    //console.log(droppedFiles);
    //console.log(filesFormData);

    try {
      const response = await fetch(RESTAPIUri + "/file/upload/" + displayedConv?._id, {
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
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      setDroppedFiles([]);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const sendFile = async () => {
    const fileNamesTimeStamped = await uploadFiles();
    console.log("fichiers envoyés");
    console.log(fileNamesTimeStamped);
    await sendMessage(fileNamesTimeStamped.fileNames);
    //console.log("msg envoyé");
  };

  const sendEmoji = () => {
    if (!displayedConv) return;
    const messageData = {
      author: user?.userName,
      authorId: user?._id,
      text: [displayedConv.customization.emoji],
      seenBy: [user?.userName],
      date: new Date(),
      conversationId: displayedConv?._id,
    };
    postMessage(messageData);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleGifPickerContainerClick);
    return () => {
      document.removeEventListener("mousedown", handleGifPickerContainerClick);
    };
  }, []);
  return (
    <>
      <div className="icons">
        <div className="icon">
          {" "}
          <AddCircle
            color={"black"}
            title="Ouvrir plus d'actions"
            height="3vh"
            width="3vh"
            style={{ marginRight: "0.5rem" }}
          />
        </div>

        {!inputMessage && displayedConv !== null && (
          <>
            <div className="icon">
              {" "}
              <ImagesOutline
                onClick={openFileInput}
                title="Joindre un fichier"
                color={"black"}
                width={"1.5rem"}
                height={"1.5rem"}
                style={{ transform: "rotate(270deg)" }}
              />
            </div>
            <div className="icon">
              {" "}
              <ImagesOutline
                onClick={() => console.log(droppedFiles)}
                color={"black"}
                width={"1.5rem"}
                height={"1.5rem"}
                style={{ transform: "rotate(270deg)" }}
              />
            </div>

            <div
              className="gif-icon icon"
              ref={gifPickerRef}
              onClick={() => setShowGifPicker(!showGifPicker)}
            >
              <ImagesOutline
                width={"1.5rem"}
                height={"1.5rem"}
                color={"black"}
                title={"Envoyer un GIF"}
                style={{ transform: "rotate(270deg)" }}
              />
              <div className="gif-picker-container" onClick={(e) => e.stopPropagation()}>
                {" "}
                {showGifPicker && (
                  <GifPicker
                    tenorApiKey={process.env.REACT_APP_TENOR_API_KEY as string}
                    onGifClick={(gif) => handleGifClick(gif)}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="message-input" style={inputMessage ? { flex: "auto" } : {}}>
        <input
          type="file"
          ref={inputFileRef}
          style={{ display: "none" }}
          multiple
          onChange={handleFileChange}
        />
        {droppedFiles.length > 0 ? (
          <div>{filePreview()}</div>
        ) : (
          <textarea
            className="send-message"
            placeholder="Aa"
            value={inputMessage}
            rows={3}
            onKeyDown={handleKeyDown}
            ref={inputMessageRef}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInputMessage(e.target.value)
            }
            onFocus={() => emitUserWrittingToSocket(true)}
            onBlur={() => emitUserWrittingToSocket(false)}
          />
        )}
      </div>
      <div className="like-icon">
        {inputMessage || droppedFiles.length > 0 ? (
          <Send
            color={"#00000"}
            height="3vh"
            width="3vh"
            onClick={() => (droppedFiles ? sendFile() : sendMessage())}
          />
        ) : (
          <div style={{ cursor: "pointer", fontSize: "1.5rem" }} onClick={() => sendEmoji()}>
            {displayedConv?.customization.emoji}
          </div>
        )}
      </div>
    </>
  );
}

export default NormalFooter;
