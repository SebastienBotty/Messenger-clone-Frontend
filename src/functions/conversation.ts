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

  const conv = mutedConvArr.find(
    (conv) => conv.conversationId === conversationId
  );
  return conv ? new Date(conv.untilDate) > new Date() : false;
};
