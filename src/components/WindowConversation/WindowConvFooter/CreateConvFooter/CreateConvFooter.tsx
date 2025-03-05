import React, { useRef, useState } from "react";
import "./CreateConvFooter.css";
import { Send } from "react-ionicons";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
  useTriggerContext,
} from "../../../../screens/userLoggedIn/userLoggedIn";
import {
  useAddedMembersContext,
  useMessagesContext,
  useUserContext,
} from "../../../../constants/context";
import { isPrivateConvExisting, postConversation } from "../../../../api/conversation";
import { postMessage } from "../../../../api/message";
import { ConversationType, MessageType } from "../../../../typescript/types";
import { socket } from "../../../../Sockets/socket";
import { getUsersSocket } from "../../../../api/user";

function CreateConvFooter({}: {}) {
  const { addedMembers, setAddedMembers } = useAddedMembersContext();
  const { user } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { messages, setMessages } = useMessagesContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { setTrigger } = useTriggerContext();

  const [inputMessage, setInputMessage] = useState<string>("");
  const inputMessageRef = useRef<HTMLTextAreaElement>(null);

  const emitMsgToSocket = (
    messageData: MessageType,
    convMembersSocket: Promise<any>,
    conversation: ConversationType | null
  ) => {
    const socketData = [convMembersSocket, messageData, conversation];
    //console.log(messages[messages.length - 1]);
    //console.log(socketData);
    socket.emit("message", socketData);
    console.log("EMITTING  MESSAGE ICIIIIIIIIIIIIIIII");
  };
  const createConversation = async () => {
    if (!user) return;
    if (addedMembers.length > 1) {
      const convCreated = await postConversation(user, addedMembers, inputMessage);
      if (convCreated) {
        setDisplayedConv(convCreated);
        setTimeout(() => {
          sendMessage(convCreated);
        }, 1000);
        setAddedMembers([]);
      }
    } else if (addedMembers.length == 1) {
      console.log("CREATE CONV WITH 1 PERSON");
      //If user wants to create a conversation with only one person, it first checks in his conversations if he doesn't already have a private (not a group where ppl left and they are only 2 left) conversation with the selected person.
      const existingConv = await isPrivateConvExisting(user, addedMembers);
      if (existingConv) {
        console.log("existing convvvvvvvv");
        setTimeout(() => {
          sendMessage(existingConv);
        }, 1000);
        setDisplayedConv(existingConv);
        setAddedMembers([]);
      } else {
        console.log("UNEXISTING CONV");
        const convCreated = await postConversation(user, addedMembers, inputMessage);
        console.log("CONV CREATED");
        console.log(convCreated);
        if (convCreated) {
          setTimeout(() => {
            console.log("oui");
            sendMessage(convCreated);
            console.log("ENCORE OUI");
          }, 1000);
          setDisplayedConv(convCreated);
          setAddedMembers([]);
        }
      }
    } else {
      console.log("pas assez de membre");
    }
  };
  const sendMessage = async (conversation: ConversationType) => {
    if (!user) return;
    console.log("ALLOALLOALLAOALAOALAOALO");
    const trimmedString = inputMessage.replace(/^\s+|\s+$/g, "");
    console.log("SEND MSG CALLED");
    const messageData = {
      author: user.userName,
      authorId: user._id,

      text: [trimmedString],
      seenBy: [{ username: user.userName, userId: user._id, seenDate: new Date() }],
      date: new Date(),
      conversationId: conversation._id,
      responseToMsgId: null,
    };
    //console.log("iciiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    //console.log(messageData.text);
    setInputMessage("");

    const postedMsg = await postMessage(messageData);
    console.log("POSTED MSG");
    console.log(postedMsg);
    if (postedMsg) {
      console.log("MESSAGE POST OKLM");
      console.log(postedMsg);
      setTrigger((prev) => !prev);
      setMessages((messages) => [...messages, postedMsg]);
      setMostRecentConv(conversation);
      emitMsgToSocket(postedMsg, await getUsersSocket(conversation, user), conversation);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && inputMessage.trim() != "" && !event.shiftKey) {
      event.preventDefault();
      createConversation();
    }
  };
  return (
    <>
      <div className="message-input" style={inputMessage ? { flex: "auto" } : {}}>
        <textarea
          className="send-message"
          placeholder="Aa"
          value={inputMessage}
          rows={3}
          onKeyDown={handleKeyDown}
          ref={inputMessageRef}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
        />
      </div>
      <div className="like-icon">
        <Send color={"#00000"} height="3vh" width="3vh" onClick={() => createConversation()} />
      </div>
    </>
  );
}

export default CreateConvFooter;
