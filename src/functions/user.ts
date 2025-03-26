import { patchBlockUser } from "../api/user";
import { BlockedUsersType, UserDataType } from "../typescript/types";

export const isUserBlocked = (
  userId: string,
  usersBlockedArr: BlockedUsersType[],
  now = new Date()
) => {
  const blockedUser = usersBlockedArr.find((user) => user.userId === userId);
  if (!blockedUser) return false;

  const lastBlock = blockedUser.dates[blockedUser.dates.length - 1];

  if (now > new Date(lastBlock.start) && now < new Date(lastBlock.end)) {
    return true;
  }
  return false;
};

export const blockUser = async (
  blockedUserId: string,
  blockedUsersArr: BlockedUsersType[],
  userId: string,
  setUser: React.Dispatch<React.SetStateAction<UserDataType | null>>
) => {
  const blockingUser = !isUserBlocked(blockedUserId, blockedUsersArr);
  const response = await patchBlockUser(userId, blockedUserId, blockingUser);
  if (response) {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, blockedUsers: response };
    });
  }
};
