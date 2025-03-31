import React, { ReactNode, useEffect, useState } from "react";

import "./AsyncMsg.css";
import { LinkFormatter } from "../../Utiles/LinkFormatter/LinkFormatter";
import ImageVizualizer from "../../ImageVizualizer/ImageVizualizer";
import { ImgS3DataType, MessageType } from "../../../typescript/types";
import { fetchFilesData } from "../../../api/file";

function AsyncMsg({ message }: { message: MessageType }) {
  const convId = message.conversationId;
  const text = message.text[message.text.length - 1];
  const [content, setContent] = useState<ReactNode | null | JSX.Element[]>(null);
  const [showImgVisualizer, setShowImgVisualizer] = useState<boolean | null>(false);
  const [imgData, setImgData] = useState<ImgS3DataType>({
    _id: "",
    src: "",
    name: "",
    convId: "",
    lastModified: new Date(),
  });

  const getFiles = async (fileNamesStr: string) => {
    if (!message.conversationId) return false;
    const response = await fetchFilesData(fileNamesStr, message.conversationId);

    return response;
  };

  const handleImgClick = (
    fileUrl: string,
    fileName: string,
    fileId: string,
    lastModified: Date
  ) => {
    if (convId) {
      console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
      console.log(fileName);
      setImgData({
        src: fileUrl,
        name: fileName,
        convId: convId,
        _id: fileId,
        lastModified: lastModified,
      });
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
                loading="lazy"
              />
            }
          </div>
        );
      } else if (!text.startsWith("PATHIMAGE/" + convId + ":")) {
        setContent(<span>{<LinkFormatter text={text} />}</span>); // <span>{text}</span>);
      } else {
        const fileNamesStr = text.split("PATHIMAGE/" + convId + ":")[1];
        const files = await getFiles(fileNamesStr);

        const tempContent: ReactNode[] = [];
        if (!files) {
          tempContent.push(<span>Erreur lors du chargement</span>);
          return;
        }

        for (const file of files) {
          if (file.type === "image") {
            tempContent.push(
              <div className="file-preview-item">
                <img
                  loading="lazy"
                  onClick={() =>
                    handleImgClick(file.url, file.fileName, file._id, file.lastModified)
                  }
                  src={file.url}
                  alt={file.fileName}
                />
              </div>
            );
          } else if (file.type === "video") {
            tempContent.push(
              <div className="file-preview-item" onClick={() => console.log(file)}>
                <video src={file.url} />
              </div>
            );
          } else {
            tempContent.push(
              <div onClick={() => console.log(file)}>
                {" "}
                <a href={file.url} download={file.fileName.split("-")[1]}>
                  <img src="/file-icon.png" alt={file.fileName} loading="lazy" />
                  <div className="file-name">{file.fileName.split("-")[1]}</div>
                </a>
              </div>
            );
          }
        }

        if (tempContent.length === 1) {
          const singleElement = tempContent[0];

          if (React.isValidElement(singleElement) && singleElement.props.children.type === "img") {
            tempContent[0] = React.cloneElement(singleElement, {
              ...singleElement.props,
              className: `${singleElement.props.className} single-image-preview`,
            });
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
