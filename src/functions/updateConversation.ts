import {
  ConversationMemberType,
  ConversationType,
  CustomizationType,
  RemovedMembersType,
} from "../typescript/types";

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
  const addedMemberIds = new Set(members.map((member) => member.userId));

  const updatedRemovedMembers = prev.removedMembers
    ? prev.removedMembers.filter((member: RemovedMembersType) => !addedMemberIds.has(member.userId))
    : [];

  return {
    ...prev,
    members: [...prev.members, ...members],
    removedMembers: updatedRemovedMembers,
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
    const updatedConv = updateConvAddedMembers(convCopy, members, convCopy);
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  //if conv isn't found
  const updatedConv = updateConvAddedMembers(conversation, members, conversation);
  return updatedConv;
};

export const updateConvRemovedMembers = (
  prev: any,
  targetUsername: string,
  targetUserId: string,
  targetPhoto: string,
  conversation: ConversationType
) => {
  if (!prev) {
    console.log("CONVERSATION prev is null");
    return conversation;
  }
  return {
    ...prev,
    members: prev.members.filter(
      (member: ConversationMemberType) => member.username !== targetUsername
    ),
    removedMembers: [
      ...prev.removedMembers,
      { username: targetUsername, userId: targetUserId, date: new Date(), photo: targetPhoto },
    ],
  };
};

export const updateMostRecentConvRemovedMembers = (
  conversations: ConversationType[],
  prev: any,
  targetUsername: string,
  targetUserId: string,
  targetPhoto: string,
  conversation: ConversationType
) => {
  const conv = conversations.find((conv) => conv._id === conversation._id);
  if (conv) {
    const convCopy = { ...conv };
    const updatedConv = updateConvRemovedMembers(
      convCopy,
      targetUsername,
      targetUserId,
      targetPhoto,
      convCopy
    );
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  return prev;
};

export const updateConvCustomization = (
  prev: any,
  customizationKey: keyof CustomizationType,
  customizationValue: string,
  conversation: ConversationType
) => {
  if (!prev) {
    console.log("CONVERSATION prev is null");
    return conversation;
  }
  return {
    ...prev,
    customization: {
      ...prev.customization,
      [customizationKey]: customizationValue,
    },
  };
};

export const updateMostRecentConvCustomization = (
  conversations: ConversationType[],
  prev: any,
  customizationKey: keyof CustomizationType,
  customizationValue: string,
  conversation: ConversationType
) => {
  const conv = conversations.find((conv) => conv._id === conversation._id);
  if (conv) {
    const convCopy = { ...conv };
    const updatedConv = updateConvCustomization(
      convCopy,
      customizationKey,
      customizationValue,
      convCopy
    );
    console.log("updatedConvCustomization", updatedConv);
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  return prev;
};

export const updateConvAdmin = (
  prev: any,
  targetUsername: string,
  changeAdmin: boolean, // true if adding admin, false if removing admin
  conversation: ConversationType
) => {
  if (!prev) {
    console.log("CONVERSATION prev is null");
    return conversation;
  }
  return {
    ...prev,
    admin: changeAdmin
      ? [...prev.admin, targetUsername]
      : prev.admin.filter((admin: string) => admin !== targetUsername),
  };
};

export const updateMostRecentConvAdmin = (
  conversations: ConversationType[],
  prev: any,
  targetUsername: string,
  changeAdmin: boolean,
  conversation: ConversationType
) => {
  const conv = conversations.find((conv) => conv._id === conversation._id);
  if (conv) {
    const convCopy = { ...conv };
    const updatedConv = updateConvAdmin(convCopy, targetUsername, changeAdmin, convCopy);
    return { ...updatedConv, lastMessage: conversation.lastMessage };
  }
  return prev;
};
