import React, { useEffect, useRef } from "react";
import { ConversationType } from "../../../typescript/types";
import "./ConversationParams.css";

function ConversationParams({
  conversation,
  closeComponent,
}: {
  conversation: ConversationType;
  closeComponent: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      closeComponent();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="conversation-params-dropdown" ref={ref}>
      ConversationParams <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
      <div className="oui">ouioui</div>
    </div>
  );
}

export default ConversationParams;
