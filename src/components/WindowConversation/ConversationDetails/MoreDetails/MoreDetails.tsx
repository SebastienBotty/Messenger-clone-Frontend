import React from "react";
import "./MoreDetails.css";
import { ArrowBackOutline } from "react-ionicons";
function MoreDetails({
  component,
  setShowMoreDetailsComp,
  title,
}: {
  component: React.ReactNode;
  setShowMoreDetailsComp: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
}) {
  return (
    <div className="more-details-container">
      <div className="more-details-header">
        <div
          className="icon-button-back"
          onClick={() => {
            setShowMoreDetailsComp(false);
          }}
        >
          {" "}
          <ArrowBackOutline
            color={"#00000"}
            title="Retour"
            height="1.75rem"
            width="1.75rem"
          />
        </div>

        <h3>{title}</h3>
      </div>

      <div className="more-details-content"> {component} </div>
    </div>
  );
}

export default MoreDetails;
