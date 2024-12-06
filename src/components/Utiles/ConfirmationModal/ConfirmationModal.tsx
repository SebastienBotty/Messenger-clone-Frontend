import React, { useEffect, useRef } from "react";

import "./ConfirmationModal.css";
import "../../TransferModal/TransferModal.css";
import { Close } from "react-ionicons";
export default function ConfirmationModal({
  title,
  text,
  action,
  closeModal,
  width,
}: {
  title: string;
  text: string | JSX.Element;
  action: () => void;
  closeModal: () => void;
  width?: string;
}) {
  const confirmationModalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        confirmationModalRef.current &&
        !confirmationModalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
  return (
    <div className="modal">
      <div className="modal-overlay">
        <div
          className="modal-content modal-content-confirmation"
          style={{ width }}
          ref={confirmationModalRef}
        >
          <div className="modal-content-inner modal-content-inner-confirmation">
            <div className="modal-title modal-confirmation-title">
              <div className="modal-title-text modal-confirmation-title-text">
                {" "}
                <h2>{title}</h2>
              </div>
              <div className="modal-close-button modal-confirmation-close-button">
                <Close
                  onClick={closeModal}
                  color="black"
                  title={"Fermer"}
                  height="2rem"
                  width="2rem"
                />
              </div>
            </div>
            <div className="modal-confirmation-text">{text}</div>
            {typeof text === "string" && (
              <div className="modal-confirmation-action">
                <button className="cancel-button confirmation-modal-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button className="confirm-button confirmation-modal-btn" onClick={action}>
                  Confirmer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
