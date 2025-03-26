import React, { useContext, useEffect, useState } from "react";
import "./ActionsList.css";
import {
  useDisplayedConvContext,
  useMostRecentConvContext,
} from "../../../../screens/userLoggedIn/userLoggedIn";
import { ConvMembersLi } from "./ConvMembersLi/ConvMembersLi";
import imageCompression from "browser-image-compression";

import {
  useBlockedConvsContext,
  useConversationsContext,
  useMessagesContext,
  useUserContext,
} from "../../../../constants/context";

import {
  ChevronDownOutline,
  Disc,
  ExitOutline,
  ImagesOutline,
  TextOutline,
  PencilOutline,
  PersonAdd,
  DocumentTextOutline,
  BanOutline,
  LockClosedOutline,
  TimerOutline,
} from "react-ionicons";
import AddMembersModal from "./AddMembersModal/AddMembersModal";
import LoadingSpinner from "../../../Utiles/loadingSpinner/loadingSpinner";
import ConfirmationModal from "../../../Utiles/ConfirmationModal/ConfirmationModal";
import ChangeConvName from "./ChangeConvName/ChangeConvName";
import { confirmationMessage } from "../../../../constants/ConfirmationMessage";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { isConvMuted } from "../../../../functions/conversation";
import NotificationsDisplay from "../../../Utiles/NotificationsDisplay/NotificationsDisplay";
import { leaveConv, patchConvEmoji, postConvPhoto } from "../../../../api/conversation";
import ChangeNicknames from "./ChangeNicknames/ChangeNicknames";
import {
  updateConvCustomization,
  updateMostRecentConvCustomization,
} from "../../../../functions/updateConversation";
import ColorThemePicker from "./ColorThemePicker/ColorThemePicker";
import { blockUser, isUserBlocked } from "../../../../functions/user";
import { ConversationMemberType } from "../../../../typescript/types";

function ActionsList({
  openMoreDetailsComp,
}: {
  openMoreDetailsComp: (componentName: string) => void;
}) {
  const { conversations } = useConversationsContext();
  const { user, setUser } = useUserContext();
  const { displayedConv, setDisplayedConv } = useDisplayedConvContext();
  const { blockedConversations } = useBlockedConvsContext();
  const { setMostRecentConv } = useMostRecentConvContext();
  const { setMessages } = useMessagesContext();
  const [active1, setActive1] = useState<boolean>(false);
  const [active2, setActive2] = useState<boolean>(false);
  const [active3, setActive3] = useState<boolean>(false);
  const [active4, setActive4] = useState<boolean>(false);

  const [changePhotoLoading, setChangePhotoLoading] = useState<boolean>(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

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
  const [partner, setPartner] = useState<ConversationMemberType | undefined>(undefined);
  const [mutedConv, setMutedConv] = useState<boolean>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleActionsClick = (actionName: string) => {
    if (!displayedConv || !user) return;
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
      case "leaveConv":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: confirmationMessage.leaveConv.title,
          text: confirmationMessage.leaveConv.text,
          action: async () => {
            const req = await leaveConv(displayedConv._id, user.userName, user._id);
            if (req) {
              console.log("c ok");
              setShowConfirmationModal(false);
            }
          },
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
      case "changeNicknames":
        setShowConfirmationModal(true);
        setConfirmationModalAction({
          title: "Pseudos",
          text: (
            <ChangeNicknames
              conversation={displayedConv}
              closeModal={() => setShowConfirmationModal(false)}
            />
          ),
          action: () => {},
          closeModal: () => setShowConfirmationModal(false),
        });
        break;
    }
  };

  const handleThemeClick = () => {
    setShowColorPicker(true);
  };

  const handleEmojiClick = async (emojiData: EmojiClickData) => {
    if (!displayedConv || !user) return;
    const changeEmoji = await patchConvEmoji(emojiData.emoji, displayedConv._id, user._id);
    if (changeEmoji) {
      setDisplayedConv((prev) =>
        updateConvCustomization(
          prev,
          changeEmoji.customizationKey,
          changeEmoji.customizationValue,
          changeEmoji.conversation
        )
      );
      setMostRecentConv((prev) =>
        updateMostRecentConvCustomization(
          conversations,
          prev,
          changeEmoji.customizationKey,
          changeEmoji.customizationValue,
          changeEmoji.conversation
        )
      );
      setMessages((prev) => [...prev, changeEmoji.conversation.lastMessage]);
      setShowConfirmationModal(false);
    }
  };

  // Conversation Photo handling
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 10 MB

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!displayedConv || !user) return;
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
        reader.onloadend = async () => {
          if (reader.result) {
            const setBase64Image = reader.result as string;
            //console.log("Image en Base64:", reader.result);
            const size = (setBase64Image.length / 1024).toFixed(2);
            //console.log(size + "Ko");
            const response = await postConvPhoto(setBase64Image, displayedConv._id, user._id);
            if (response) {
              setDisplayedConv((prev) =>
                updateConvCustomization(
                  prev,
                  response.customizationKey,
                  response.customizationValue,
                  response.conversation
                )
              );
              setMostRecentConv((prev) =>
                updateMostRecentConvCustomization(
                  conversations,
                  prev,
                  response.customizationKey,
                  response.customizationValue,
                  response.conversation
                )
              );
              setMessages((prev) => {
                return [...prev, response.conversation.lastMessage];
              });
              setChangePhotoLoading(false);
              //console.log(jsonData);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } else {
              setChangePhotoLoading(false);
            }
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

  const handleBlockClick = () => {
    console.log("ALALALALAAOALAO");
    if (!displayedConv || !user?._id || displayedConv.isGroupConversation) return;
    console.log("111111");
    console.log(partner);
    if (partner) {
      console.log("blocking");
      blockUser(partner.userId, user.blockedUsers, user._id, setUser);
    }
    console.log("over");
  };

  useEffect(() => {
    if (!displayedConv?.isGroupConversation && displayedConv && user?._id) {
      setPartner(displayedConv.members.find((member) => member.userId !== user._id));
    }
    return () => {};
  }, [displayedConv?._id]);

  useEffect(() => {
    setMutedConv(isConvMuted(user?.mutedConversations, displayedConv?._id));
    return () => {};
  }, [user?.mutedConversations, displayedConv?._id]);
  if (!displayedConv || !user) return <></>;

  return (
    <div className="actions-list">
      <ul className="ul-actions-category">
        <li className="category-title" onClick={() => setActive1(!active1)}>
          <div className="title-text">Personnaliser la discussion</div>
          <div className={active1 ? "title-arrow-icon active" : "title-arrow-icon"}>
            <ChevronDownOutline color={"#00000"} />
          </div>
        </li>
        <ul className={"actions-content" + (active1 ? " active" : "")}>
          {displayedConv.isGroupConversation && (
            <>
              <li className="li-actions" onClick={() => handleActionsClick("changeConvName")}>
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
                <li className="li-actions" onClick={() => fileInputRef.current?.click()}>
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
          <li className="li-actions" id="conversation-theme" onClick={() => handleThemeClick()}>
            <div className="li-icon">
              <Disc color={displayedConv.customization.theme} />
            </div>
            <span>Modifier le thème</span>
            {showColorPicker && (
              <ColorThemePicker
                conversation={displayedConv}
                setShowColorPicker={setShowColorPicker}
              />
            )}
          </li>
          <li className="li-actions" onClick={() => handleActionsClick("changeEmoji")}>
            <div className="li-icon">{displayedConv.customization.emoji}</div>

            <span>Modifier l'emoji</span>
          </li>
          <li className="li-actions" onClick={() => handleActionsClick("changeNicknames")}>
            <div className="li-icon">
              <TextOutline color={"#00000"} />
            </div>
            <span>Modifier les pseudos</span>
          </li>
        </ul>{" "}
      </ul>
      {displayedConv.isGroupConversation && (
        <ul className="ul-actions-category">
          <li className="category-title" onClick={() => setActive2(!active2)}>
            <div className="title-text">Membres de la discussion</div>
            <div className={active2 ? "title-arrow-icon active" : "title-arrow-icon"}>
              {" "}
              <ChevronDownOutline color={"#00000"} />
            </div>
          </li>
          <ul className={"actions-content" + (active2 ? " active" : "")}>
            {displayedConv.members.map((member) => (
              <ConvMembersLi key={member.userId} member={member} />
            ))}

            {displayedConv.admin.includes(user.userName) && (
              <li className="li-actions" onClick={() => setShowAddMembersModal(true)}>
                <div className="li-icon">
                  <PersonAdd color={"#00000"} />
                </div>
                <span>Ajouter des membres</span>
              </li>
            )}
          </ul>
        </ul>
      )}
      <ul className="ul-actions-category">
        <li className="category-title" onClick={() => setActive3(!active3)}>
          <div className="title-text">Fichiers et contenus multimédia</div>
          <div className={active3 ? "title-arrow-icon active" : "title-arrow-icon"}>
            {" "}
            <ChevronDownOutline color={"#00000"} />
          </div>
        </li>
        <ul className={"actions-content" + (active3 ? " active" : "")}>
          <li className="li-actions" onClick={() => openMoreDetailsComp("ConvMedia-Medias")}>
            <div className="li-icon">
              <ImagesOutline color={"#00000"} />
            </div>
            <span>Contenu multimédia</span>
          </li>
          <li className="li-actions" onClick={() => openMoreDetailsComp("ConvMedia-Files")}>
            <div className="li-icon">
              <DocumentTextOutline color={"#00000"} />
            </div>
            <span>Fichiers</span>
          </li>
        </ul>
      </ul>
      <ul className="ul-actions-category">
        <li className="category-title" onClick={() => setActive4(!active4)}>
          <div className="title-text">Confidentialité et assistance</div>
          <div className={active4 ? "title-arrow-icon active" : "title-arrow-icon"}>
            {" "}
            <ChevronDownOutline color={"#00000"} />
          </div>
        </li>
        <ul className={"actions-content" + (active4 ? " active" : "")}>
          <li className="li-actions">
            <NotificationsDisplay
              conversation={displayedConv}
              outlineNotifSvg={false}
              iconSize="1.5rem"
            />
          </li>
          <li className="li-actions" onClick={() => alert("Not implemented")}>
            <div className="li-icon">
              <TimerOutline color={"#00000"} />
            </div>
            <span>Messages éphémères</span>
          </li>
          <li className="li-actions" onClick={() => alert("Not implemented")}>
            <div className="li-icon">
              <LockClosedOutline color={"#00000"} />
            </div>
            <span>Vérifier le chiffrement bout en bout</span>
          </li>

          {displayedConv.isGroupConversation ? (
            <li className="li-actions" onClick={() => handleActionsClick("leaveConv")}>
              <div className="li-icon">
                <ExitOutline color={"#00000"} />
              </div>
              <span>Quitter le groupe</span>
            </li>
          ) : (
            <>
              <li className="li-actions" onClick={() => console.log(blockedConversations)}>
                <div className="li-icon">
                  <Disc color={"#00000"} />
                </div>
                <span>Restreindre</span>
              </li>
              <li className="li-actions" onClick={() => handleBlockClick()}>
                <div className="li-icon">
                  <BanOutline color={"#00000"} />
                </div>
                {partner && isUserBlocked(partner.userId, user.blockedUsers)
                  ? "Débloquer"
                  : "Bloquer"}
              </li>
            </>
          )}
        </ul>
      </ul>
      {showAddMembersModal && (
        <AddMembersModal
          conversation={displayedConv}
          closeModal={() => setShowAddMembersModal(false)}
        />
      )}
      {showConfirmationModal && <ConfirmationModal {...confirmationModalAction} />}
    </div>
  );
}

export default ActionsList;
