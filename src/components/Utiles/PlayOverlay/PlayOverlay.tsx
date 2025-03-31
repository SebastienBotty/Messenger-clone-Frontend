import React from "react";
import { PlayCircleOutline } from "react-ionicons";

import "./PlayOverlay.css";

function PlayOverlay({ svgSize }: { svgSize: string }) {
  return (
    <div className="play-overlay">
      <div className="play-svg-container">
        {" "}
        <PlayCircleOutline height={svgSize} width={svgSize} color="white" />
      </div>
    </div>
  );
}

export default PlayOverlay;
