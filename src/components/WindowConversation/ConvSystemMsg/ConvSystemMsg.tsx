import React, { useContext } from "react";
import "./ConvSystemMsg.css";

import { UserContext } from "../../../screens/userLoggedIn/userLoggedIn";

function ConvSystemMsg({ textProps }: { textProps: string }) {
  const user = useContext(UserContext);
  const event = textProps.split("-");
  const agent = event[0];
  const action = event[1];
  let target = "";

  if (event[2]) {
    target = event[2];
  }

  if (!user) return null;
  const text = (agent: string, eventName: string, target?: string) => {
    const agentName = agent === user.userName ? "Vous avez " : agent + " a ";

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
    }
  };
  return <div className="conv-system-msg">{text(agent, action, target)}</div>;
}

export default ConvSystemMsg;
