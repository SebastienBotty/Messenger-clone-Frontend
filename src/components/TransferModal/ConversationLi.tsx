import React, { useState } from "react";
import "./ConversationLi.css";
import { ConversationType, MessageType, UserDataType } from "../../typescript/types";
import { ApiToken } from "../../localStorage";
import { socket } from "../../Sockets/socket";
import { useMostRecentConvContext } from "../../screens/userLoggedIn/userLoggedIn";
import ProfilePic from "../Utiles/ProfilePic/ProfilePic";
import { transferMsg } from "../../api/message";
import { getNickNameByUsername } from "../../functions/StrFormatter";
import { postTransferImage } from "../../api/file";

function ConversationLi(props: {
  conversation: ConversationType;
  user: UserDataType | null;
  selectedImg: string;
  selectedMsg?: MessageType;
}) {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const conversation = props.conversation;
  const user = props.user;
  const selectedImg = props.selectedImg;
  const selectedMsg = props.selectedMsg;

  const [sendingStatus, setSendingStatus] = useState<number>(-1);
  const [btnMessage, setBtnMessage] = useState<string>("Envoyer");
  const { mostRecentConv, setMostRecentConv } = useMostRecentConvContext();

  const isPrivateConv = !conversation.isGroupConversation;
  let partner;
  if (isPrivateConv) {
    partner = conversation.members.find((member) => member.userId !== user?._id);
  }

  const transferImage = async () => {
    if (!user?._id) return;
    setSendingStatus(0);
    setBtnMessage("Envoi");

    const postData = {
      userId: user._id,
      sender: user.userName,
      targetConversationId: conversation._id,
      fileUrl: selectedImg,
      date: new Date(),
    };

    return await postTransferImage(postData);
  };

  const getUsersSocket = async (conversation: ConversationType | null) => {
    const convMembersStr = conversation?.members
      ?.filter((member) => member.username !== user?.userName)
      .map((member) => member.username)
      .join("-");
    try {
      const response = await fetch(RESTAPIUri + "/user/getSockets?convMembers=" + convMembersStr, {
        headers: {
          Authorization: "Bearer " + ApiToken(),
        },
      });
      const jsonData = await response.json();
      console.log("ICI SOCKET");
      console.log(jsonData);

      return jsonData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const emitMsgTransferedMsgToSocket = (
    messageData: MessageType,
    convMembersSocket: Promise<any>,
    conversation: ConversationType | null
  ) => {
    const socketData = [convMembersSocket, messageData, conversation];
    console.log(socketData);

    socket.emit("message", socketData);
  };

  const handleSend = async () => {
    const convMembersSocket = await getUsersSocket(conversation);
    const messageData = selectedMsg
      ? await transferMsg(selectedMsg, conversation._id)
      : await transferImage();
    if (messageData) {
      emitMsgTransferedMsgToSocket(messageData, convMembersSocket, conversation);
      setTimeout(() => {
        setBtnMessage("Envoyé");
        setSendingStatus(1);
      }, 500);
    } else {
      setBtnMessage("Echec");
      setSendingStatus(1);

      setTimeout(() => {
        setBtnMessage("Envoyer");
        setSendingStatus(-1);
      }, 1000);
    }
    setMostRecentConv(conversation);
  };

  if (!(conversation && user)) {
    return null;
  }
  return (
    <li
      style={{ marginLeft: "2.5rem", marginRight: "2.5rem" }}
      className="modal-transfer-conversation"
      key={conversation._id}
      onClick={() => {
        console.log(conversation);
      }}
    >
      <div className="modal-conversation-photo">
        {isPrivateConv ? (
          <ProfilePic
            picSrc={partner?.photo}
            status={partner?.status}
            isOnline={partner?.isOnline}
            isGroupConversationPic={false}
          />
        ) : (
          <ProfilePic
            picSrc={conversation.customization.photo}
            status={undefined}
            isGroupConversationPic={true}
          />
        )}{" "}
      </div>
      <div className="modal-conversation-name">
        {conversation.isGroupConversation
          ? conversation.customization.conversationName
            ? conversation.customization.conversationName
            : conversation.members
                .filter((item) => item.username !== user?.userName)
                .map((member) => getNickNameByUsername(conversation.members, member.username))
                .join(", ")
          : conversation.members
              .filter((item) => item.username !== user?.userName)
              .map((member) => getNickNameByUsername(conversation.members, member.username))}{" "}
      </div>
      <div className="modal-send-button">
        <button
          className="modal-send-btn"
          disabled={sendingStatus > -1}
          onClick={() => handleSend()}
          style={{ backgroundColor: sendingStatus > -1 ? "#dfe9f2" : "ebf5ff" }}
        >
          {btnMessage}
        </button>
      </div>
    </li>
  );
}

export default ConversationLi;
