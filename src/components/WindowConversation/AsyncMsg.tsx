import React, { ReactNode, useEffect, useState } from "react";

import "./AsyncMsg.css";
import { ApiToken } from "../../localStorage";

interface AsyncMessageProps {
  text: string;
  convId: string | undefined;
}
function AsyncMsg({ text, convId }: AsyncMessageProps) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const fetchFilesUrl = async (fileNamesStr: string) => {
    try {
      const response = await fetch(
        RESTAPIUri +
          "/file/conversationId/" +
          convId +
          "/getFiles?fileNames=" +
          fileNamesStr,
        {
          method: "GET",
          headers: {
            authorization: "Bearer " + ApiToken(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching files");
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

  useEffect(() => {
    const fetchData = async () => {
      if (!text.startsWith("PATHIMAGE/" + convId + ":")) {
        setContent(<span>{text}</span>);
      } else {
        const fileNamesStr = text.split("PATHIMAGE/" + convId + ":")[1];
        const files = await fetchFilesUrl(fileNamesStr);

        const tempContent: ReactNode[] = [];
        for (const file of files) {
          if (file.type === "image") {
            tempContent.push(
              <div className="file-preview-item">
                <img src={file.previewUrl} alt={file.fileName} />
              </div>
            );
          } else {
            tempContent.push(
              <div>
                {" "}
                <a
                  href={file.downloadUrl}
                  download={file.fileName.split("-")[1]}
                >
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
  }, []);

  if (content === null) {
    return <span>Loading...</span>;
  }

  return <div className="msg-file-container">{content}</div>;
}
export default AsyncMsg;
