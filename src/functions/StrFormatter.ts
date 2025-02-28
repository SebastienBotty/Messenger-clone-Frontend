import { ConversationMemberType, ConversationType } from "../typescript/types";

export const convMemberMsg = (
  members: ConversationMemberType[],
  username: string,
  agent: string,
  eventName: string,
  target?: string,
  nickname?: string
) => {
  const agentName =
    agent === username ? "Vous avez " : `${getNickNameByUsername(members, agent)} a `;

  if (target === username && (eventName === "addUser" || eventName === "removeUser")) {
    if (eventName === "addUser") {
      return agent === username
        ? `Vous avez été ajouté à la conversation.`
        : `${agent} vous a ajouté à la conversation.`;
    }
    if (eventName === "removeUser") {
      return agent === username
        ? `Vous avez été retiré de la conversation.`
        : `${agent} vous a retiré de la conversation.`;
    }
  }
  if (eventName === "changeNickname" && target === username) {
    if (agent === username) {
      return `Vous vous êtes renommé en: ${nickname} .`;
    }
    return `${getNickNameByUsername(members, agent)} vous a renommé en: ${nickname} .`;
  }

  if (target && target.split(",").length > 2) {
    target = `${target.split(",")[0]} et ${target.split(",").length - 1} autres`;
  }

  if (target && target.split(",").length === 2) {
    target = `${target.split(",")[0]} et ${target.split(",")[1]}`;
  }

  switch (eventName) {
    case "addUser":
      return `${agentName}ajouté ${target} à la conversation.`;
    case "removeUser":
      return `${agentName}retiré ${target} de la conversation.`;
    case "leaveConversation":
      return `${agentName}quité la conversation.`;
    case "changeConversationPhoto":
      return `${agentName}changé la photo de la conversation.`;
    case "changeConversationName":
      return `${agentName}nommé la conversation. ${target}`; // Not a real "target", just used it to show the new name
    case "changeEmoji":
      return `${agentName}défini ${target} comme emoji de la conversation.`;
    case "sendFile":
      return `${agentName}envoyé un fichier.`;
    case "sendGif":
      return `${agentName}envoyé un gif.`;
    case "changeNickname":
      return `${agentName}renommé ${target}  en: ${nickname} .`;
    default:
      return "";
  }
};

export const getMessageText = (
  conversationId: string,
  username: string,
  author: string | undefined,
  text: string | undefined
) => {
  if (!text) return "";
  if (text === "Ce message a été supprimé") {
    return author === username ? "Vous avez retiré ce message" : `${author} a retiré ce message.`;
  }
  if (text.startsWith("GIF/" + conversationId)) {
    return author === username ? "Vous avez envoyé un gif" : `${author} a envoyé un GIF.`;
  }
  if (text.startsWith("PATHIMAGE/" + conversationId)) {
    return author === username ? "Vous avez envoyé un fichier" : `${author} a envoyé un fichier.`;
  }
  return author === username ? `Vous: ${text}` : `${author}: ${text}`;
};

export const getNickNameById = (members: ConversationMemberType[], userId: string) => {
  const member = members.find((member) => member.userId === userId);
  if (!member) return "undefined";
  if (member.nickname) {
    return member.nickname;
  }
  return member.username;
};

export const getNickNameByUsername = (members: ConversationMemberType[], username: string) => {
  const member = members.find((member) => member.username === username);
  if (!member?.nickname) return username;
  return member.nickname;
};
