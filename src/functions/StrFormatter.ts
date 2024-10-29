export const convMemberMsg = (
  username: string,
  agent: string,
  eventName: string,
  target?: string
) => {
  const agentName = agent === username ? "Vous avez " : agent + " a ";
  if (target && target?.split(",").length > 2) {
    target =
      target?.split(",")[0] +
      " et " +
      (target?.split(",").length - 1) +
      " autres";
  }

  if (target && target?.split(",").length === 2) {
    target = target?.split(",")[0] + " et " + target?.split(",")[1];
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
  }
};
