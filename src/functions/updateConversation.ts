import { ConversationMemberType, ConversationType } from "../typescript/types";

export const updateConv = (
  prev: any,
  actionName: string,
  actionTargetId: string,
  actionValue: string,
  conversation: ConversationType
) => {
  switch (actionName) {
    case "changeNickname":
      return updateConversationMembers(prev, actionTargetId, actionValue, conversation);
    default:
      return prev;
  }
};

export const updateMostRecentConv = (
  prev: any,
  conversations: ConversationType[],
  conversation: ConversationType,
  actionName: string,
  actionTargetId: string,
  actionValue: string
) => {
  const conv = conversations.find((conv) => conv._id === conversation._id);
  if (conv) {
    console.log("CONV FOUND");
    const convCopy = { ...conv };
    const updatedConv = updateConv(convCopy, actionName, actionTargetId, actionValue, convCopy);
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  return prev;
};

export const updateConversationMembers = (
  prev: any,
  memberId: string,
  inputValue: string | ConversationMemberType[],
  conversation: ConversationType
) => {
  if (!prev) {
    console.log("CONVERSATION prev is null");
    return conversation;
  }
  console.log("updating");
  return {
    ...prev,
    members: prev.members.map((item: ConversationMemberType) => {
      if (item.userId === memberId) {
        console.log("updating nickname");
        return { ...item, nickname: inputValue };
      }
      return item;
    }),
  };
};

export const updateConvAddedMembers = (
  prev: any,
  members: ConversationMemberType[],
  conversation: ConversationType
) => {
  if (!prev) {
    console.log("CONVERSATION prev is null");
    return conversation;
  }
  return {
    ...prev,
    members: [...prev.members, ...members],
  };
};

export const updateMostRecentConvAddedMembers = (
  conversations: ConversationType[],
  prev: any,
  members: ConversationMemberType[],
  conversation: ConversationType
) => {
  const conv = conversations.find((conv) => conv._id === conversation._id);
  if (conv) {
    const convCopy = { ...conv };
    const updatedConv = updateConvAddedMembers(prev, members, convCopy);
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  return prev;
};

export const updateConvRemovedMembers = (
  prev: any,
  removedUsername: string,
  conversation: ConversationType
) => {
  if (!prev) {
    console.log("CONVERSATION prev is null");
    return conversation;
  }
  return {
    ...prev,
    members: prev.members.filter(
      (member: ConversationMemberType) => member.username !== removedUsername
    ),
    removedMembers: [
      ...prev.removedMembers,
      { username: removedUsername, removedData: new Date() },
    ],
  };
};

export const updateMostRecentConvRemovedMembers = (
  conversations: ConversationType[],
  prev: any,
  removedUsername: string,
  conversation: ConversationType
) => {
  const conv = conversations.find((conv) => conv._id === conversation._id);
  if (conv) {
    const convCopy = { ...conv };
    const updatedConv = updateConvRemovedMembers(prev, removedUsername, convCopy);
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  return prev;
};
