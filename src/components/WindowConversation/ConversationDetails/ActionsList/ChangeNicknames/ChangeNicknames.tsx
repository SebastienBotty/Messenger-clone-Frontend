import "./ChangeNicknames.css";
import { ConversationType } from "../../../../../typescript/types";
import ChangeNicknamesLi from "./ChangeNicknamesLi";

const ChangeNicknames = ({
  conversation,
  closeModal,
}: {
  conversation: ConversationType;
  closeModal: () => void;
}) => {
  const members = conversation.members;

  return (
    <div className="change-nicknames">
      <ul>
        {members.map((member) => (
          <ChangeNicknamesLi key={member._id} member={member} closeModal={closeModal} />
        ))}
      </ul>
    </div>
  );
};

export default ChangeNicknames;
