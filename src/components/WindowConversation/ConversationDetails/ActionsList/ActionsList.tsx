import React, { useState } from "react";
import "./ActionsList.css";
import { useDisplayedConvContext } from "../../../../screens/userLoggedIn/userLoggedIn";
import { ConvMembersLi } from "./ConvMembersLi/ConvMembersLi";

import { ChevronDownOutline, Disc, PersonAdd } from "react-ionicons";
import AddMembersModal from "./AddMembersModal/AddMembersModal";

function ActionsList() {
  const [active1, setActive1] = useState(false);
  const [active2, setActive2] = useState(false);
  const [active3, setActive3] = useState(false);
  const [active4, setActive4] = useState(false);

  const [showAddMembersModal, setShowAddMembersModal] =
    useState<boolean>(false);

  const { displayedConv } = useDisplayedConvContext();
  if (!displayedConv) return <></>;

  return (
    <div className="actions-list">
      <ul className="ul-actions-category">
        <li className="category-title" onClick={() => setActive1(!active1)}>
          <div className="title-text">Personnaliser la discussion</div>
          <div
            className={active1 ? "title-arrow-icon active" : "title-arrow-icon"}
          >
            <ChevronDownOutline color={"#00000"} />
          </div>
        </li>
        <ul className={"actions-content" + (active1 ? " active" : "")}>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Modifier le thème</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Modifier l'emoji</span>
          </li>
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Modifier les pseudos</span>
          </li>
        </ul>
      </ul>
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
          <li className="li-actions">
            <div className="li-icon">
              <Disc color={"#00000"} />
            </div>
            <span>Contenu multimédia</span>
          </li>
          <li className="li-actions">
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
    </div>
  );
}

export default ActionsList;
