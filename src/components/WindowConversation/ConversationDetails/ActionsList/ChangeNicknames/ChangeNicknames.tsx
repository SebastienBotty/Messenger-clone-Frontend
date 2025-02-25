import "./ChangeNicknames.css";
import { ConversationType } from "../../../../../typescript/types";
import ChangeNicknamesLi from "./ChangeNicknamesLi";

const ChangeNicknames = ({ conversation }: { conversation: ConversationType }) => {
  const members = conversation.members;

  return (
    <div className="change-nicknames">
      <ul>
        {members.map((member) => (
          <ChangeNicknamesLi key={member._id} member={member} />
        ))}
      </ul>
    </div>
  );
};

export default ChangeNicknames;
