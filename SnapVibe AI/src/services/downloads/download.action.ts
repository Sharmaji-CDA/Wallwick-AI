import { safeAction } from "../../utils/safe.action";
import { recordDownload } from "./download.service";

export const downloadAsset = async (
  imageId: string,
  userId: string
) => {
  return safeAction(() =>
    recordDownload(imageId, userId)
  );
};