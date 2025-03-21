import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { ConversationType } from "../../../../../typescript/types";

import "./ColorThemePicker.css";
import { CheckmarkDoneOutline } from "react-ionicons";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../../screens/userLoggedIn/userLoggedIn";
import {
  updateConvCustomization,
  updateMostRecentConvCustomization,
} from "../../../../../functions/updateConversation";
import { patchConvTheme } from "../../../../../api/conversation";
import { useConversationsContext, useUserContext } from "../../../../../constants/context";
import LoadingSpinner from "../../../../Utiles/loadingSpinner/loadingSpinner";

function ColorThemePicker({
  conversation,
  setShowColorPicker,
}: {
  conversation: ConversationType;
  setShowColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { conversations } = useConversationsContext();
  const [loading, setLoading] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement>(null);

  const [initialColor, setInitialColor] = useState<string | undefined>(
    conversation.customization.theme
  );
  const [hasColorChanged, setHasColorChanged] = useState<boolean>(false);
  const [colorPicker, setColorPicker] = useState<string | undefined>(
    conversation.customization.theme
  );

  const changeColor = async () => {
    if (!colorPicker || !displayedConv || !user?._id) return;
    setHasColorChanged(false);
    setLoading(true);
    const response = await patchConvTheme(colorPicker, displayedConv?._id, user._id);

    if (response) {
      setMostRecentConv((prev) =>
        updateMostRecentConvCustomization(conversations, prev, "theme", colorPicker, displayedConv)
      );
      setLoading(false);
      setShowColorPicker(false);
      setHasColorChanged(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!colorPicker || !displayedConv) return;

    setDisplayedConv((prev) => updateConvCustomization(prev, "theme", colorPicker, displayedConv));
  }, [colorPicker]);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      if (!hasColorChanged && initialColor && displayedConv) {
        setDisplayedConv((prev) =>
          updateConvCustomization(prev, "theme", initialColor, displayedConv)
        );
      }
      setTimeout(() => setShowColorPicker(false), 150);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="color-picker-container" ref={ref}>
      <HexColorPicker color={colorPicker} onChange={setColorPicker} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <button
          className="validate-button"
          disabled={initialColor === colorPicker}
          onClick={() => changeColor()}
        >
          <CheckmarkDoneOutline width={"1.5rem"} height={"1.5rem"} />
        </button>
      )}
    </div>
  );
}

export default ColorThemePicker;
