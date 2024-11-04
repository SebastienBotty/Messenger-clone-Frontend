import { MediasType } from "../typescript/types";
import { getFileTypeFromPathName } from "./file";

export const checkCacheFile = (
  fileData: MediasType,
  conversationId: string
) => {
  let cacheKey = "";
  if (getFileTypeFromPathName(fileData.Key) === "Files")
    cacheKey = `filesCache_${conversationId}`;
  else cacheKey = `mediasCache_${conversationId}`;

  const cachedFiles = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");
  if (cachedFiles.length > 0) {
    return true;
  }
  return false;
};
