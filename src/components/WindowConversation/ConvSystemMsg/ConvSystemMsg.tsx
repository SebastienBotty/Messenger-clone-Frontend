import { convMemberMsg } from "../../../functions/StrFormatter";
import { useUserContext } from "../../../constants/context";
import { ConversationMemberType } from "../../../typescript/types";
function ConvSystemMsg({
  textProps,
  members,
}: {
  textProps: string;
  members: ConversationMemberType[] | undefined;
}) {
  const { user } = useUserContext();
  const event = textProps.split("-");
  const agent = event[0];
  const action = event[1];
  let target = "";
  let nickname = "";

  if (event[2]) {
    target = event[2];
  }
  if (event[3]) {
    nickname = event[3];
  }

  if (!user || !members) return null;

  return <div>{convMemberMsg(members, user.userName, agent, action, target, nickname)}</div>;
}

export default ConvSystemMsg;
