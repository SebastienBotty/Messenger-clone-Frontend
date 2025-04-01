import React, { useState, useEffect, useContext } from "react";
import { ImgS3DataType, MediasType } from "../../../../../../typescript/types";
import ImageVizualizer from "../../../../../ImageVizualizer/ImageVizualizer";
import { useDisplayedConvContext } from "../../../../../../screens/userLoggedIn/userLoggedIn";
import { ApiToken } from "../../../../../../localStorage";
import InfiniteScroll from "react-infinite-scroll-component";

import "./MediasGrid.css";
import { useConversationMediasContext, useUserContext } from "../../../../../../constants/context";
import PlayOverlay from "../../../../../Utiles/PlayOverlay/PlayOverlay";
import { videoFileExtensions } from "../../../../../../constants/OthersConstant";
import { isVideoFile } from "../../../../../../functions/file";

function MediasGrid() {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const { displayedConv } = useDisplayedConvContext();
  const { mediasCtxt, setMediasCtxt } = useConversationMediasContext();
  const { user, setUser } = useUserContext();
  const [imgData, setImgData] = useState<ImgS3DataType>({
    _id: "",
    src: "",
    fileName: "",
    convId: "",
    lastModified: new Date(),
  });

  const [showImgVisualizer, setShowImgVisualizer] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchImgIndex, setFetchImgIndex] = useState<number>(0);

  const handleImgClick = (media: MediasType) => {
    if (!displayedConv) return;
    const fileName = getFilenameFromUrl(media.Url);
    setImgData({
      src: media.Url,
      fileName: fileName,
      convId: displayedConv._id,
      _id: media._id,
      lastModified: media.LastModified,
    });
    setShowImgVisualizer(true);
  };
  const getFilenameFromUrl = (url: string) => {
    console.log(url);
    const urlParts = url.split("/");
    const path = urlParts[urlParts.length - 2] + "/";
    const filename = urlParts[urlParts.length - 1].split("?X-Amz")[0];
    const pathFilename = path + filename;
    console.log(pathFilename);
    return pathFilename;
  };
  const fetchMedias = async () => {
    console.log("fetch called");
    if (!displayedConv || !user) return;
    const cacheKey = `mediasCache_${displayedConv._id}`;
    const cachedMedias = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");

    if (fetchImgIndex === 0 && cachedMedias.length > 0) {
      console.log("cace");
      setMediasCtxt(cachedMedias);
      setFetchImgIndex(cachedMedias.length);
      console.log(cachedMedias);
      return;
    }
    console.log(fetchImgIndex);
    try {
      console.log("fetch");
      const response = await fetch(
        RESTAPIUri +
          "/file/userId/" +
          user._id +
          "/conversationId/" +
          displayedConv._id +
          "/getRecentFiles?start=" +
          fetchImgIndex +
          "&fileType=Medias",
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

      const newMedias = [...cachedMedias, ...jsonData];
      setMediasCtxt(newMedias);
      setFetchImgIndex((prev) => prev + jsonData.length);
      sessionStorage.setItem(cacheKey, JSON.stringify(newMedias));
    } catch (error) {}
  };
  useEffect(() => {
    if (!displayedConv || !user) return;

    //useEffect
    fetchMedias();
    return () => {
      setMediasCtxt([]);
    };
  }, []);

  if (!displayedConv) return null;
  return (
    <div className="medias-grid">
      <div className="infinite-scroll-container" id="infinite-scroll-container">
        {mediasCtxt.length > 0 ? (
          <InfiniteScroll
            className="media-container"
            dataLength={mediasCtxt.length}
            next={fetchMedias}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            scrollableTarget="infinite-scroll-container"
          >
            {mediasCtxt.map((item, index) => {
              return isVideoFile(item.Key) ? (
                <>
                  <div key={index} className="media-item">
                    <PlayOverlay svgSize="50%" />
                    <video src={item.Url} onClick={() => handleImgClick(item)} />
                  </div>
                </>
              ) : (
                <div key={index} className="media-item">
                  <img src={item.Url} onClick={() => handleImgClick(item)} />
                </div>
              );
            })}
          </InfiniteScroll>
        ) : (
          <div className="no-media">Aucun média</div>
        )}
      </div>
      {showImgVisualizer && (
        <ImageVizualizer closeVisualizer={() => setShowImgVisualizer(false)} imgData={imgData} />
      )}
    </div>
  );
}

export default MediasGrid;
