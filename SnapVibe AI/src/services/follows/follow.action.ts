import { safeAction } from "../../utils/safe.action";
import { toggleFollow } from "./follow.service";

export const followCreator = async (
  userId: string,
  creatorId: string
) => {
  return safeAction(() =>
    toggleFollow(userId, creatorId)
  );
};