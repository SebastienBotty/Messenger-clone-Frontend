import React, { useState, useEffect, useContext } from "react";
import { ImgS3DataType, MediasType } from "../../../../../../typescript/types";
import ImageVizualizer from "../../../../../ImageVizualizer/ImageVizualizer";
import {
  useDisplayedConvContext,
  UserContext,
} from "../../../../../../screens/userLoggedIn/userLoggedIn";
import { ApiToken } from "../../../../../../localStorage";
import InfiniteScroll from "react-infinite-scroll-component";

import "./MediasGrid.css";

function MediasGrid() {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const { displayedConv } = useDisplayedConvContext();
  const user = useContext(UserContext);
  const [imgData, setImgData] = useState<ImgS3DataType>({
    src: "",
    name: "",
    convId: "",
  });

  const [medias, setMedias] = useState<MediasType[]>([]);
  const [showImgVisualizer, setShowImgVisualizer] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchImgIndex, setFetchImgIndex] = useState<number>(0);

  const handleImgClick = (media: MediasType) => {
    if (!displayedConv) return;
    const fileName = getFilenameFromUrl(media.Url);
    setImgData({ src: media.Url, name: fileName, convId: displayedConv._id });
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
    if (!displayedConv || !user) return;
    console.log("FETCH CALLED");

    const cacheKey = `mediasCache_${displayedConv._id}`;
    const cachedMedias = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");

    if (fetchImgIndex === 0 && cachedMedias.length > 0) {
      setMedias(cachedMedias);
      setFetchImgIndex(cachedMedias.length);
      return;
    }
    console.log(fetchImgIndex);
    try {
      const response = await fetch(
        RESTAPIUri +
          "/file/userId/" +
          user._id +
          "/conversationId/" +
          displayedConv._id +
          "/getRecentImages?start=" +
          fetchImgIndex,
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
      setMedias(newMedias);
      setFetchImgIndex((prev) => prev + jsonData.length);
      sessionStorage.setItem(cacheKey, JSON.stringify(newMedias));
    } catch (error) {}
  };
  useEffect(() => {
    if (!displayedConv || !user) return;

    //useEffect
    fetchMedias();
    return () => {};
  }, []);

  if (!displayedConv) return null;
  return (
    <div className="medias-grid">
      <div className="infinite-scroll-container" id="infinite-scroll-container">
        <InfiniteScroll
          className="media-container"
          dataLength={medias.length}
          next={fetchMedias}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          scrollableTarget="infinite-scroll-container"
        >
          {medias.map((item, index) => (
            <div key={index} className="media-item">
              <img src={item.Url} onClick={() => handleImgClick(item)} />
            </div>
          ))}
        </InfiniteScroll>
      </div>
      {showImgVisualizer && (
        <ImageVizualizer
          closeVisualizer={() => setShowImgVisualizer(false)}
          imgData={imgData}
        />
      )}
    </div>
  );
}

export default MediasGrid;
