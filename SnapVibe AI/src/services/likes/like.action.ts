import { safeAction } from "../../utils/safe.action";
import { toggleLike } from "./like.service";

export const likeAsset = async (
  userId: string,
  imageId: string
) => {
  return safeAction(() =>
    toggleLike(userId, imageId)
  );
};