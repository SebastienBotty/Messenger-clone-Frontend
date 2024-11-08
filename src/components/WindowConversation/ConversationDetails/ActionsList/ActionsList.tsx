import React, { useContext, useState } from "react";
import "./ActionsList.css";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../screens/userLoggedIn/userLoggedIn";
import { ConvMembersLi } from "./ConvMembersLi/ConvMembersLi";
import imageCompression from "browser-image-compression";

import {
  useMessagesContext,
  useUserContext,
} from "../../../../constants/context";

import {
  ChevronDownOutline,
  Disc,
  ImagesOutline,
  PencilOutline,
  PersonAdd,
} from "react-ionicons";
import AddMembersModal from "./AddMembersModal/AddMembersModal";
import { ApiToken } from "../../../../localStorage";
import LoadingSpinner from "../../../Utiles/loadingSpinner/loadingSpinner";
import ConfirmationModal from "../../../Utiles/ConfirmationModal/ConfirmationModal";
import ChangeConvName from "./ChangeConvName/ChangeConvName";
import { confirmationMessage } from "../../../../constants/ConfirmationMessage";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

function ActionsList({
  openMoreDetailsComp,
}: {
  openMoreDetailsComp: (componentName: string) => void;
}) {
  const RESTAPIUri = process.env.REACT_APP_REST_API_URI;

  const [active1, setActive1] = useState<boolean>(false);
  const [active2, setActive2] = useState<boolean>(false);
  const [active3, setActive3] = useState<boolean>(false);
  const [active4, setActive4] = useState<boolean>(false);

  const [changePhotoLoading, setChangePhotoLoading] = useState<boolean>(false);
  const [showAddMembersModal, setShowAddMembersModal] =
    useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const [confirmationModalAction, setConfirmationModalAction] = useState<{
    title: string;
    text: string | JSX.Element;
    action: () => void;
    closeModal: () => void;
    width?: string;
  }>({
    title: "",
    text: "",
    action: () => {},
    closeModal: () => setShowConfirmationModal(false),
  });

  const { user, setUser } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { setMessages } = useMessagesContext();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleActionsClick = (actionName: string) => {
    switch (actionName) {
      case "changeConvName":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: confirmationMessage.changeConvName.title,
          text: (
            <ChangeConvName
              {...{
                closeModal: () => setShowConfirmationModal(false),
                text: confirmationMessage.changeConvName.text,
              }}
            />
          ),
          action: () => {},
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "changeEmoji":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: "Emoji",
          text: <EmojiPicker onEmojiClick={(e) => handleEmojiClick(e)} />,
          action: () => {},
          closeModal: () => setShowConfirmationModal(false),
          width: "auto",
        });
        break;
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    changeEmoji(emojiData.emoji);
  };

  const changeEmoji = async (emoji: string) => {
    if (!displayedConv || !user) return;
    try {
      const response = await fetch(`${RESTAPIUri}/conversation/changeEmoji`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ApiToken()}`,
        },
        body: JSON.stringify({
          conversationId: displayedConv._id,
          emoji: emoji,
          userId: user._id,
          date: new Date(),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const data = await response.json();
      console.log(data);
      setDisplayedConv(data.conversation);
      setMostRecentConv(data.conversation);
      setMessages((prev) => [...prev, data.message]);
      setShowConfirmationModal(false);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("An unknown error occurred");
      }
    }
  };

  // Conversation Photo handling
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 10 MB

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        fileInputRef.current!.value = "";
        alert("La taille de l'image ne doit pas depasser 2 Mo.");
        return;
      }
      setChangePhotoLoading(true);
      //console.log(file.size);
      const options = {
        maxSizeMB: 1, // Taille maximale de l'image compressée en Mo
        maxWidthOrHeight: 1920, // Largeur ou hauteur maximale
        useWebWorker: true, // Utiliser un worker web pour le traitement
      };

      try {
        const compressedFile = await imageCompression(file, options);

        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const setBase64Image = reader.result as string;
            //console.log("Image en Base64:", reader.result);
            const size = (setBase64Image.length / 1024).toFixed(2);
            //console.log(size + "Ko");
            postConvPhoto(setBase64Image);
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Erreur lors de la compression de l'image:", error);
        setChangePhotoLoading(false);
      }
    } else {
      console.log("no file");
    }
  };

  const postConvPhoto = async (base64String: string) => {
    try {
      const response = await fetch(
        `${RESTAPIUri}/conversation/changeConversationPhoto`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ApiToken()}`,
          },
          body: JSON.stringify({
            conversationId: displayedConv?._id,
            photoStr: base64String,
            userId: user?._id,
            date: new Date(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setChangePhotoLoading(false);
        throw new Error(error.message);
      }

      const jsonData = await response.json();
      setDisplayedConv(jsonData.conversation);
      setMostRecentConv(jsonData.conversation);
      setMessages((prev) => {
        return [...prev, jsonData.message];
      });
      setChangePhotoLoading(false);
      //console.log(jsonData);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Erreur inconnue");
      }
    }
  };

  if (!displayedConv || !user) return <></>;

  return (
    <div className="actions-list">
      {displayedConv.admin.includes(user.userName) ||
      !displayedConv.isGroupConversation ? (
        <ul className="ul-actions-category">
          <li className="category-title" onClick={() => setActive1(!active1)}>
            <div className="title-text">Personnaliser la discussion</div>
            <div
              className={
                active1 ? "title-arrow-icon active" : "title-arrow-icon"
              }
            >
              <ChevronDownOutline color={"#00000"} />
            </div>
          </li>
          <ul className={"actions-content" + (active1 ? " active" : "")}>
            {displayedConv.isGroupConversation && (
              <>
                <li
                  className="li-actions"
                  onClick={() => handleActionsClick("changeConvName")}
                >
                  <div className="li-icon">
                    <PencilOutline color={"#00000"} />
                  </div>
                  <span>Modifier le nom de la discussion</span>
                </li>
                {changePhotoLoading ? (
                  <li className="li-actions">
                    <LoadingSpinner />
                  </li>
                ) : (
                  <li
                    className="li-actions"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="li-icon">
                      <ImagesOutline color={"#00000"} />
                    </div>
                    <span>Changer la photo</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="conversation-photo-file-input"
                      onChange={handleImageChange}
                      accept=".jpg, .jpeg, .png"
                      multiple={false}
                    />
                  </li>
                )}
              </>
            )}
            <li className="li-actions">
              <div className="li-icon">
                <Disc color={displayedConv.customization.theme} />
              </div>
              <span>Modifier le thème</span>
            </li>
            <li
              className="li-actions"
              onClick={() => handleActionsClick("changeEmoji")}
            >
              <div className="li-icon">{displayedConv.customization.emoji}</div>

              <span>Modifier l'emoji</span>
            </li>
          </ul>{" "}
        </ul>
      ) : (
        <></>
      )}
      {displayedConv.isGroupConversation && (
        <ul className="ul-actions-category">
          <li className="category-title" onClick={() => setActive2(!active2)}>
            <div className="title-text">Membres de la discussion</div>
            <div
              className={
                active2 ? "title-arrow-icon active" : "title-arrow-icon"
              }
            >
              {" "}
              <ChevronDownOutline color={"#00000"} />
            </div>
          </li>
          <ul className={"actions-content" + (active2 ? " active" : "")}>
            {displayedConv.members.map((member) => (
              <ConvMembersLi key={member} member={member} />
            ))}
            <li
              className="li-actions"
              onClick={() => setShowAddMembersModal(true)}
            >
              <div className="li-icon">
                <PersonAdd color={"#00000"} />
              </div>
              <span>Ajouter des membres</span>
            </li>
          </ul>
        </ul>
      )}
      <ul className="ul-actions-category">
        <li className="category-title" onClick={() => setActive3(!active3)}>
          <div className="title-text">Fichiers et contenus multimédia</div>
          <div
            className={active3 ? "title-arrow-icon active" : "title-arrow-icon"}
          >
            {" "}
            <ChevronDownOutline color={"#00000"} />
          </div>
        </li>
        <ul className={"actions-content" + (active3 ? " active" : "")}>
          <li
            className="li-actions"
            onClick={() => openMoreDetailsComp("ConvMedia-Medias")}
          >
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Contenu multimédia</span>
          </li>
          <li
            className="li-actions"
            onClick={() => openMoreDetailsComp("ConvMedia-Files")}
          >
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Fichiers</span>
          </li>
        </ul>
      </ul>
      <ul className="ul-actions-category">
        <li className="category-title" onClick={() => setActive4(!active4)}>
          <div className="title-text">Confidentialité et assistance</div>
          <div
            className={active4 ? "title-arrow-icon active" : "title-arrow-icon"}
          >
            {" "}
            <ChevronDownOutline color={"#00000"} />
          </div>
        </li>
        <ul className={"actions-content" + (active4 ? " active" : "")}>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Mettre les messages en sourdine</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Messages éphémères</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Vérifier le chiffrement bout en bout</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Restreindre</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Bloquer</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Signaler</span>
          </li>
        </ul>
      </ul>

      {showAddMembersModal && (
        <AddMembersModal
          showAddMembersModal={showAddMembersModal}
          setShowAddMembersModal={setShowAddMembersModal}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal {...confirmationModalAction} />
      )}
    </div>
  );
}

export default ActionsList;
