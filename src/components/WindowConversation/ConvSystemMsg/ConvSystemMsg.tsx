import React, { useContext } from "react";
import { convMemberMsg } from "../../../functions/StrFormatter";
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

  return <div>{convMemberMsg(user.userName, agent, action, target)}</div>;
}

export default ConvSystemMsg;
