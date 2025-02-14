import React, { ReactNode, useEffect, useState } from "react";

import "./AsyncMsg.css";
import { ApiToken } from "../../../localStorage";
import { LinkFormatter } from "../../Utiles/LinkFormatter/LinkFormatter";
import ImageVizualizer from "../../ImageVizualizer/ImageVizualizer";
import { ImgS3DataType, MessageType } from "../../../typescript/types";

function AsyncMsg({ message }: { message: MessageType }) {
  const convId = message.conversationId;
  const text = message.text[message.text.length - 1];
  const [content, setContent] = useState<ReactNode | null | JSX.Element[]>(null);
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;
  const [showImgVisualizer, setShowImgVisualizer] = useState<boolean | null>(false);
  const [imgData, setImgData] = useState<ImgS3DataType>({
    src: "",
    name: "",
    convId: "",
  });

  const fetchFilesUrl = async (fileNamesStr: string) => {
    try {
      const response = await fetch(
        RESTAPIUri + "/file/conversationId/" + convId + "/getFiles?fileNames=" + fileNamesStr,
        {
          method: "GET",
          headers: {
            authorization: "Bearer " + ApiToken(),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const JSONData = await response.json();

      return JSONData.files;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const handleImgClick = (fileUrl: string, fileName: string) => {
    if (convId) {
      console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      console.log(fileName);
      setImgData({ src: fileUrl, name: fileName, convId: convId });
    }
    setShowImgVisualizer(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (text.startsWith("GIF/" + convId + ":")) {
        const gifUrl = text.split("GIF/" + convId + ":")[1];
        setContent(
          <div>
            {
              <img
                className="gif-img"
                src={gifUrl}
                alt="gif"
                onClick={() => window.open(gifUrl)}
                style={{ cursor: "pointer" }}
              />
            }
          </div>
        );
      } else if (!text.startsWith("PATHIMAGE/" + convId + ":")) {
        setContent(<span>{<LinkFormatter text={text} />}</span>); // <span>{text}</span>);
      } else {
        const fileNamesStr = text.split("PATHIMAGE/" + convId + ":")[1];
        const files = await fetchFilesUrl(fileNamesStr);

        const tempContent: ReactNode[] = [];
        for (const file of files) {
          if (file.type === "image") {
            tempContent.push(
              <div className="file-preview-item">
                <img
                  onClick={() => handleImgClick(file.url, file.fileName)}
                  src={file.url}
                  alt={file.fileName}
                />
              </div>
            );
          } else {
            tempContent.push(
              <div>
                {" "}
                <a href={file.url} download={file.fileName.split("-")[1]}>
                  <img src="/file-icon.png" alt={file.fileName} />
                  <div className="file-name">{file.fileName.split("-")[1]}</div>
                </a>
              </div>
            );
          }
        }

        setContent(tempContent);
      }
    };

    fetchData();
  }, [message.text]);

  return (
    <div className="async-msg">
      <div
        className="msg-file-container"
        style={message.deletedForEveryone ? { fontStyle: "italic", color: "#4C4C4D" } : {}}
      >
        {content}
      </div>

      {showImgVisualizer && (
        <ImageVizualizer closeVisualizer={() => setShowImgVisualizer(false)} imgData={imgData} />
      )}
    </div>
  );
}
export default AsyncMsg;
