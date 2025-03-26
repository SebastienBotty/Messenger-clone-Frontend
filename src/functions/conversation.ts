import { ConversationType } from "../typescript/types";

interface mutedConvArr {
  conversationId: string;
  untilDate: Date;
}

export const isConvMuted = (
  mutedConvArr: mutedConvArr[] | undefined,
  conversationId: string | undefined
): boolean => {
  if (!mutedConvArr || !conversationId) {
    console.log("pas bon");
    return false;
  }

  const conv = mutedConvArr.find((conv) => conv.conversationId === conversationId);
  return conv ? new Date(conv.untilDate) > new Date() : false;
};

export const hasPrivateConvWithUser = (userId: string, conversationsArr: ConversationType[]) => {
  const conv = conversationsArr.find(
    (conv) => conv.members.some((member) => member.userId === userId) && !conv.isGroupConversation
  );
  return conv;
};

export const isPrivateConvBlocked = (
  conversationId: string,
  blockedConvsArr: ConversationType[]
) => {
  return blockedConvsArr.some((blockedConv) => blockedConv._id === conversationId);
};
