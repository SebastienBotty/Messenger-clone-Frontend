import React, { useState } from "react";

import "./ConvMedia.css";
import MediasGrid from "./MediasGrid/MediasGrid";
import FilesList from "./FilesList/FilesList";

function ConvMedia({ mediaType }: { mediaType: string }) {
  const [selectedType, setSelectedType] = useState<string>(mediaType);

  return (
    <div className="conv-media">
      <div className="conv-media-header">
        <div className="medias-title-container">
          <div
            className={`medias-title ${
              selectedType === "Medias" ? "selected-type" : ""
            }`}
            onClick={() => setSelectedType("Medias")}
          >
            <h4>Contenu multimédia</h4>
          </div>
          <div
            className={`medias-title ${
              selectedType === "Files" ? "selected-type" : ""
            }`}
            onClick={() => setSelectedType("Files")}
          >
            <h4>Fichiers</h4>
          </div>{" "}
        </div>
        <div className="medias-title-bottom-bar-container">
          <div
            className={`medias-title-bottom-bar ${
              selectedType === "Medias" ? "selected-type" : ""
            }`}
          ></div>
          <div
            className={`medias-title-bottom-bar ${
              selectedType === "Files" ? "selected-type" : ""
            }`}
          ></div>
        </div>
      </div>

      <div className="media-body">
        {selectedType === "Medias" ? <MediasGrid /> : <FilesList />}{" "}
      </div>
    </div>
  );
}

export default ConvMedia;
