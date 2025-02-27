import React, { useState, useContext, useEffect } from "react";
import { useDisplayedConvContext } from "../../../../../../screens/userLoggedIn/userLoggedIn";
import "./FilesList.css";
import { ApiToken } from "../../../../../../localStorage";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatFileSize } from "../../../../../../functions/file";
import { useConversationFilesContext, useUserContext } from "../../../../../../constants/context";

function FilesList() {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const { displayedConv } = useDisplayedConvContext();
  const { user, setUser } = useUserContext();
  const { filesCtxt, setFilesCtxt } = useConversationFilesContext();

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchImgIndex, setFetchImgIndex] = useState<number>(0);

  const getFilenameFromUrl = (url: string) => {
    //console.log(url);
    const urlParts = url.split("/");
    const path = urlParts[urlParts.length - 2] + "/";
    const filename = urlParts[urlParts.length - 1].split("?X-Amz")[0];
    const pathFilename = path + filename;
    // console.log(pathFilename);
    const originalFilename = filename.split("-")[1];
    return originalFilename;
  };
  const fetchFiles = async () => {
    if (!displayedConv || !user) return;
    console.log("ALLO");
    const cacheKey = `filesCache_${displayedConv._id}`;
    const cachedFiles = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");

    if (fetchImgIndex === 0 && cachedFiles.length > 0) {
      console.log("cache");
      setFilesCtxt(cachedFiles);
      setFetchImgIndex(cachedFiles.length);
      console.log(cachedFiles);
      return;
    }
    console.log(fetchImgIndex);
    try {
      console.log("fetch called");
      const response = await fetch(
        RESTAPIUri +
          "/file/userId/" +
          user._id +
          "/conversationId/" +
          displayedConv._id +
          "/getRecentFiles?start=" +
          fetchImgIndex +
          "&fileType=Files",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer" + ApiToken(),
          },
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const jsonData = await response.json();
      if (jsonData.length === 0) {
        setHasMore(false);
        return;
      }
      console.log(jsonData);
      const newfiles = [...cachedFiles, ...jsonData];
      setFilesCtxt(newfiles);
      setFetchImgIndex((prev) => prev + jsonData.length);
      sessionStorage.setItem(cacheKey, JSON.stringify(newfiles));
    } catch (error) {}
  };

  useEffect(() => {
    if (!displayedConv || !user) return;
    console.log("useEffect");
    //useEffect
    fetchFiles();
    return () => {
      setFilesCtxt([]);
    };
  }, []);

  return (
    <div className="files-list">
      <div className="infinite-scroll-files-container" id="infinite-scroll-files-container">
        {filesCtxt.length > 0 ? (
          <InfiniteScroll
            className="files-list-infinite-scroll"
            dataLength={filesCtxt.length}
            next={fetchFiles}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            scrollableTarget="infinite-scroll-files-container"
          >
            {filesCtxt.map((item, index) => (
              <a href={item.Url} download={getFilenameFromUrl(item.Key)} className="files-item">
                <div className="files-item-img-container">
                  {" "}
                  <div>
                    {" "}
                    <img src="/file-icon.png" alt={getFilenameFromUrl(item.Key)} />
                  </div>
                </div>
                <div className="files-item-info">
                  <span className="files-item-name">{getFilenameFromUrl(item.Key)}</span>
                  <span className="files-item-size">{formatFileSize(item.Size)}</span>
                </div>
              </a>
            ))}
          </InfiniteScroll>
        ) : (
          <div className="no-media">Aucun fichier</div>
        )}
      </div>
    </div>
  );
}

export default FilesList;
