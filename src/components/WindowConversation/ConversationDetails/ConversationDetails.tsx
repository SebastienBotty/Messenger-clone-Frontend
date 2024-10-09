import React, { useEffect, useState } from "react";
import "./ConversationDetails.css";
import { SearchOutline } from "react-ionicons";
import SearchMessage from "./SearchMessage/SearchMessage";

import { useDisplayedConvContext } from "../../../screens/userLoggedIn/userLoggedIn";

function ConversationDetails() {
  const [showSearchWordComp, setShowSearchWordComp] = useState<boolean>(false);
  const { displayedConv } = useDisplayedConvContext();

  useEffect(() => {
    setShowSearchWordComp(false); // Close search message when conv is changed
    return () => {};
  }, [displayedConv]);
  return (
    <div className="conversation-details-container">
      {showSearchWordComp ? (
        <SearchMessage setShowSearchWordComp={setShowSearchWordComp} />
      ) : (
        <>
          ConversationDetails
          <div className="icon-button">
            <SearchOutline
              color={"#00000"}
              title="Rechercher"
              height="1.75rem"
              width="1.75rem"
              onClick={() => setShowSearchWordComp(true)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ConversationDetails;
