import React, { useState, useRef, useCallback, useEffect } from "react";
import { AddCircle, Close, ImagesOutline, Send, HappyOutline } from "react-ionicons";
import { useMessagesContext, useUserContext } from "../../../../constants/context";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
  useTriggerContext,
} from "../../../../screens/userLoggedIn/userLoggedIn";
import GifPicker, { TenorImage } from "gif-picker-react";
import {
  ConversationType,
  MessageType,
  PostMessageType,
  QuotedMessageType,
} from "../../../../typescript/types";
import { ApiToken } from "../../../../localStorage";
import { getUsersSocket } from "../../../../api/user";
import { socket } from "../../../../Sockets/socket";
import { calculateTotalSize, formatFileSize } from "../../../../functions/file";

import "./NormalFooter.css";
import { uploadFiles } from "../../../../api/file";
import PlayOverlay from "../../../Utiles/PlayOverlay/PlayOverlay";
import EmojiPicker from "emoji-picker-react";

function NormalFooter({
  setShowDragOverOverlay,
  droppedFiles,
  setDroppedFiles,
  onTextAreaResize,
  height,
  quotedMessage,
  setQuotedMessage,
}: {
  setShowDragOverOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  droppedFiles: File[];
  setDroppedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onTextAreaResize: (newTextareaHeight: number, reset?: string) => void;
  height: string;
  quotedMessage: QuotedMessageType | null;
  setQuotedMessage: React.Dispatch<React.SetStateAction<QuotedMessageType | null>>;
}) {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const { user } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const [inputMessage, setInputMessage] = useState<string>("");

  const { messages, setMessages } = useMessagesContext();
  const { trigger, setTrigger } = useTriggerContext();
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();

  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // Limite de 25 Mo en octets
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [showGifPicker, setShowGifPicker] = useState<boolean>(false);
  const gifPickerRef = useRef<HTMLDivElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerContainerRef = useRef<HTMLDivElement>(null);

  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, right: 0 });

  // Fonction pour mettre à jour la position quand on clique sur l'icône

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [containerHeight, setContainerHeight] = useState("auto"); // État pour la hauteur du conteneur
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleEmojiPicker = () => {
    if (emojiPickerContainerRef.current) {
      // Obtenez la position et dimensions de votre élément parent
      const rect = emojiPickerContainerRef.current.getBoundingClientRect();

      // Mettez à jour la position du sélecteur d'émojis
      setEmojiPickerPosition({
        // Positionner exactement au-dessus de l'élément parent
        top: rect.top,
        // Centrer horizontalement
        right: rect.right,
      });
      setTimeout(() => setShowEmojiPicker((prev) => !prev), 1);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    // Force le recalcul de la hauteur à chaque changement

    if (e.target.value.trim() !== "") {
      emitUserWrittingToSocket(true);
      setTimeout(adjustTextareaHeight, 0);
    } else {
      emitUserWrittingToSocket(false);

      // Réinitialise explicitement la hauteur quand le textarea est vide
      if (textAreaRef.current) {
        console.log("OCOCOCOCOCOC");
        onTextAreaResize(0, "reset");
        const height = window.innerHeight * 0.04; // 4vh en pixels
        console.log(height);
        textAreaRef.current.style.height = height + "px";
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    // Sauvegarde la position du curseur
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // Réinitialise complètement la hauteur
    textarea.style.height = "auto";

    // Calcul de la hauteur maximale et minimale
    const maxHeight = window.innerHeight * 0.3;
    const minHeight = window.innerHeight * 0.04; // 4vh en pixels

    // Définit la nouvelle hauteur en fonction du contenu - part 1
    const scrollHeight = Math.max(textarea.scrollHeight, minHeight);
    const newHeight = Math.min(scrollHeight, maxHeight);

    // Met à jour la hauteur du footer
    const footerHeightPercentage = (newHeight / window.innerHeight) * 100;
    onTextAreaResize(Math.max(7.5, footerHeightPercentage));

    // Définit la nouvelle hauteur en fonction du contenu - part 2
    textarea.style.height = `${newHeight}px`;

    // Gestion du scroll si le contenu dépasse la hauteur maximale
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";

    // Restaure la position du curseur
    textarea.setSelectionRange(selectionStart, selectionEnd);
  };

  const emitMsgToSocket = (
    messageData: MessageType,
    convMembersSocket: Promise<any>,
    conversation: ConversationType | null
  ) => {
    const socketData =
      conversation == displayedConv
        ? [convMembersSocket, messageData, conversation, messages[messages.length - 1]]
        : [convMembersSocket, messageData, conversation];
    /*     //console.log(messages[messages.length - 1]);
     */ console.log(socketData);
    socket.emit("message", socketData);
    /*     console.log("EMITTING  MESSAGE ICIIIIIIIIIIIIIIII");
     */
  };

  const emitUserWrittingToSocket = async (isWriting: boolean) => {
    if (displayedConv) {
      const convMembersSocket = await getUsersSocket(displayedConv, user);
      const socketData = [convMembersSocket, isWriting, user?.userName, displayedConv];
      socket.emit("typing", socketData);
    }
  };

  const sendMessage = (fileNames?: string[]) => {
    if (!user) return;
    const trimmedString = inputMessage.replace(/^\s+|\s+$/g, "");

    const messageData = {
      author: user.userName,
      authorId: user._id,

      text: fileNames
        ? ["PATHIMAGE/" + displayedConv?._id + ":" + fileNames.map((name) => name).join(",")]
        : [trimmedString],
      seenBy: [{ username: user.userName, userId: user._id, seenDate: new Date() }],
      date: new Date(),
      conversationId: displayedConv?._id,
      responseToMsgId: quotedMessage ? quotedMessage._id : null,
    };
    console.log("msg envoyé : " + messageData.responseToMsgId);
    //console.log("iciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    //console.log(messageData.text);
    setInputMessage("");

    postMessage(messageData);
  };
  const postMessage = async (messageData: PostMessageType, conversationData?: ConversationType) => {
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
      setMessages((prev) => [...prev, jsonData]); //--------------------------------------------------------------------------!!!!!!!!!!!!!!!!!
      setQuotedMessage(null);
      onTextAreaResize(0, "reset");
      if (textAreaRef.current) textAreaRef.current.style.height = "4vh";

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
        const encodedFileName = encodeURIComponent(file.name);
        const newFile = new File([file], encodedFileName, {
          type: file.type,
          lastModified: file.lastModified,
        });
        console.log(newFile);
        setDroppedFiles((prevFiles) => [...prevFiles, newFile]);
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

  const ContainersClick = (event: MouseEvent) => {
    if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node)) {
      setShowGifPicker(false);
    }
    if (
      emojiPickerContainerRef.current &&
      !emojiPickerContainerRef.current.contains(event.target as Node)
    ) {
      setShowEmojiPicker(false);
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
      seenBy: [{ username: user.userName, userId: user._id, seenDate: new Date() }],
      date: new Date(),
      conversationId: displayedConv._id,
      responseToMsgId: quotedMessage ? quotedMessage._id : null,
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
  const renderDroppedFiles = (file: File, index: number) => {
    return (
      <div key={index} className="file-preview-item">
        <div className="delete-file" onClick={() => deleteSelectedFile(index)}>
          <Close color={"red"} title={"Supprimer"} height="1rem" width="1rem" />
        </div>
        {file.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${file.name}`}
            className="file-preview-image"
          />
        ) : file.type.startsWith("video/") ? (
          <div className="file-icon">
            <PlayOverlay svgSize="50%" />
            <video src={URL.createObjectURL(file)} className="file-icon-img" />
          </div>
        ) : (
          <div className="file-icon">
            <img src="/file-icon.png" alt={`File Icon`} className="file-icon-img" />
            <div className="file-name">{file.name}</div>
          </div>
        )}
      </div>
    );
  };

  const filePreview = () => {
    return (
      <div
        ref={containerRef}
        style={{ height: containerHeight, overflowY: "auto", transition: "height 0.2s ease" }}
        className="file-preview-container"
      >
        {droppedFiles.map((file, index) => renderDroppedFiles(file, index))}
      </div>
    );
  };

  const sendFile = async () => {
    if (!displayedConv?._id) return;

    const fileNamesTimeStamped = await uploadFiles(droppedFiles, displayedConv._id);

    if (fileNamesTimeStamped) {
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      setDroppedFiles([]);
      console.log("fichiers envoyés");
      console.log(fileNamesTimeStamped);
      sendMessage(fileNamesTimeStamped.fileNames);
    }

    //console.log("msg envoyé");
  };

  const sendEmoji = () => {
    if (!displayedConv || !user) return;
    const messageData = {
      author: user.userName,
      authorId: user._id,
      text: [displayedConv.customization.emoji],
      seenBy: [{ username: user.userName, userId: user._id, seenDate: new Date() }],
      date: new Date(),
      conversationId: displayedConv?._id,
      responseToMsgId: quotedMessage ? quotedMessage._id : null,
    };
    postMessage(messageData);
  };

  const renderQuotedMessageAuthor = () => {
    if (!quotedMessage) return null;
    if (quotedMessage.author === user?.userName) return "vous-même";
    return quotedMessage.author;
  };

  const renderQuotedMessageText = () => {
    if (!quotedMessage || !displayedConv) return null;
    const text = quotedMessage.text[quotedMessage.text.length - 1];
    if (text.startsWith("GIF/" + displayedConv._id + ":")) {
      return "GIF";
    } else if (text.startsWith("PATHIMAGE/" + displayedConv._id + ":")) {
      return "Pièce jointe";
    }
    return text;
  };

  const stopQuotingMsg = () => {
    setQuotedMessage(null);
    setInputMessage("");
    if (textAreaRef.current) {
      console.log("OCOCOCOCOCOC");
      onTextAreaResize(0, "reset");
      const height = window.innerHeight * 0.04; // 4vh en pixels
      console.log(height);
      textAreaRef.current.style.height = height + "px";
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    if (textAreaRef.current) textAreaRef.current.focus();
  };

  useEffect(() => {
    document.addEventListener("mousedown", ContainersClick);

    // Initialise la hauteur du textarea
    if (textAreaRef.current) {
      const minHeight = window.innerHeight * 0.04;
      textAreaRef.current.style.height = `${minHeight}px`;
      textAreaRef.current.focus();
    }

    return () => {
      document.removeEventListener("mousedown", ContainersClick);
    };
  }, []);

  useEffect(() => {
    if (textAreaRef.current && quotedMessage) {
      console.log("focus");
      textAreaRef.current.focus();
    }
    return () => {};
  }, [quotedMessage]);

  useEffect(() => {
    if (containerRef.current) {
      // Réinitialiser la hauteur pour recalculer
      containerRef.current.style.height = "auto";

      const maxHeight = window.innerHeight * 0.3;
      const minHeight = window.innerHeight * 0.04; // 4vh en pixels

      // Définit la nouvelle hauteur en fonction du contenu - part 1
      const scrollHeight = Math.max(containerRef.current.scrollHeight, minHeight);
      const newHeight = Math.min(scrollHeight, maxHeight);

      // Met à jour la hauteur du footer
      const footerHeightPercentage = (newHeight / window.innerHeight) * 100;
      setContainerHeight(`${newHeight}px`); // Mettre à jour la hauteur
      onTextAreaResize(footerHeightPercentage);
    }
  }, [droppedFiles]); // Dépendance sur les fichiers pour recalculer la hauteur

  return (
    <div className="normal-footer">
      {quotedMessage && (
        <div className="normal-msg-header">
          <div className="normal-msg-header-author">
            <span style={{ fontWeight: "bold" }}>Répondre à {renderQuotedMessageAuthor()}</span>
            <span>{renderQuotedMessageText()}</span>
          </div>
          <div className="close-icon">
            <Close color={"#00000"} height="3vh" width="3vh" onClick={() => stopQuotingMsg()} />
          </div>
        </div>
      )}
      <div className="normal-msg-body">
        <div className="icons">
          <div className="icon" onClick={() => console.log(quotedMessage)}>
            <AddCircle color={"black"} title="Ouvrir plus d'actions" height="3vh" width="3vh" />
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

              <div
                className="gif-icon icon"
                ref={gifPickerRef}
                onClick={() => setShowGifPicker(!showGifPicker)}
              >
                GIF
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
        <div
          className="message-input"
          style={inputMessage ? { flex: "auto", overflow: "hidden" } : {}}
        >
          <input
            type="file"
            ref={inputFileRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileChange}
          />
          {droppedFiles.length > 0 ? (
            <>{filePreview()}</>
          ) : (
            <>
              <textarea
                className="send-message"
                placeholder="Aa"
                value={inputMessage}
                ref={textAreaRef}
                onChange={handleValueChange}
                onKeyDown={handleKeyDown}
                onFocus={() => emitUserWrittingToSocket(true)}
                onBlur={() => emitUserWrittingToSocket(false)}
                style={{
                  minHeight: "4vh",
                  maxHeight: "30vh",
                  resize: "none",
                }}
              />
              <div className="send-emoji" ref={emojiPickerContainerRef}>
                <HappyOutline onClick={toggleEmojiPicker} />
                {showEmojiPicker && (
                  <div
                    className="emojiPicker-container"
                    style={{
                      position: "fixed",
                      bottom: `calc(100vh - ${emojiPickerPosition.top}px)`,
                      right: `calc(100vw - ${emojiPickerPosition.right}px)`,
                      zIndex: 1000,
                      marginBottom: "0.5rem",
                    }}
                  >
                    <EmojiPicker onEmojiClick={(e) => handleEmojiClick(e.emoji)} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="like-icon">
          {inputMessage || droppedFiles.length > 0 ? (
            <Send
              color={"#00000"}
              height="3vh"
              width="3vh"
              onClick={() => (droppedFiles.length > 0 ? sendFile() : sendMessage())}
            />
          ) : (
            <div style={{ cursor: "pointer", fontSize: "1.5rem" }} onClick={() => sendEmoji()}>
              {displayedConv?.customization.emoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NormalFooter;
