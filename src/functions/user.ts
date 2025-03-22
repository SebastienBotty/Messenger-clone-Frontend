import { BlockedUsersType } from "../typescript/types";

export const isUserBlocked = (userId: string, usersBlockedArr: BlockedUsersType[]) => {
  const now = new Date();
  const blockedUser = usersBlockedArr.find((user) => user.userId === userId);
  if (!blockedUser) return false;

  const lastBlock = blockedUser.dates[blockedUser.dates.length - 1];

  if (now > new Date(lastBlock.start) && now < new Date(lastBlock.end)) {
    return true;
  }
  return false;
};
