import React from "react";
import "./ImageVizualizer.css";
import { useRef, useState, useEffect } from "react";

import {
  ArrowBackCircleOutline,
  ArrowForwardCircleOutline,
  CloseCircle,
  DownloadOutline,
  LogOutOutline,
} from "react-ionicons";
import { useDisplayedConvContext } from "../../screens/userLoggedIn/userLoggedIn";
import TransferModal from "../TransferModal/TransferModal";
import { ImgS3DataType, ThumbnailsImgType } from "../../typescript/types";
import { useUserContext } from "../../constants/context";
import { fetchConvImagesAround, getMoreFiles } from "../../api/file";

type SelectedImageType = {
  src: string;
  index: number;
  _id: string;
  lastModified: Date;
};

function ImageVizualizer({
  closeVisualizer,
  imgData,
}: {
  closeVisualizer: () => void;
  imgData: ImgS3DataType;
}) {
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { displayedConv } = useDisplayedConvContext();
  const [images, setImages] = useState<ThumbnailsImgType[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImg, setSelectedImg] = useState<SelectedImageType | null>(null);
  const [translateValue, setTranslateValue] = useState<number>(0);
  const [mouseMoved, setMouseMoved] = useState<boolean>(false);
  let timeoutId: NodeJS.Timeout | null = null;

  const handleImgClick = (image: SelectedImageType) => {
    console.log(image);
    if (selectedImg !== null) {
      let indexDifference: number = image.index - selectedImg.index;
      if (thumbnailsRef.current) {
        //console.log("précedent: " + selectedImg.index);

        // console.log("new :" + image.index);
        //console.log(indexDifference);
        if (indexDifference > 0) {
          // slide left
          thumbnailsRef.current.style.transform = `translateX(${
            translateValue + 4 * -indexDifference
          }rem)`;
          setTranslateValue((prev) => prev + 4 * -indexDifference);
        } else if (indexDifference < 0) {
          // slide left

          thumbnailsRef.current.style.transform = `translateX(${
            translateValue + 4 * -indexDifference
          }rem)`;
          setTranslateValue((prev) => prev + 4 * -indexDifference);
        }
        setSelectedImg(image);
      }
    }
  };

  const slideCarousel = async (side: boolean) => {
    const rejectedFilesId = images.map((image) => image._id);
    if (!side) {
      if (!user?._id || !displayedConv?._id) return;
      console.log("REFERENCE:");
      console.log(images[0]);
      const response = await getMoreFiles(
        user._id,
        displayedConv?._id,
        images[0]._id,
        true,
        rejectedFilesId
      );
      if (response) {
        console.log("RESPONSE/");
        console.log(response);
        setImages((prev) => [...response, ...prev]);
      }
    }

    setTimeout(() => {
      if (thumbnailsRef.current && selectedImg !== null) {
        if (side && selectedImg.index !== images.length - 1) {
          console.log("slide right");
          thumbnailsRef.current.style.transform = `translateX(${translateValue - 5}rem)`;
          setTranslateValue((prev) => prev - 5);
          setSelectedImg((prev) => {
            if (prev !== null) {
              return {
                src: images[prev.index + 1].src,
                index: prev.index + 1,
                _id: images[prev.index + 1]._id,
                lastModified: images[prev.index + 1].lastModified,
              };
            } else {
              return {
                src: images[0].src,
                index: 0,
                _id: images[0]._id,
                lastModified: images[0].lastModified,
              };
            }
          });
        } else if (!side && selectedImg.index !== 0) {
          console.log("slide left");
          thumbnailsRef.current.style.transform = `translateX(${translateValue + 5}rem)`;
          setTranslateValue((prev) => prev + 5);
          setSelectedImg((prev) => {
            if (prev !== null) {
              return {
                src: images[prev.index - 1].src,
                index: prev.index - 1,
                _id: images[prev.index - 1]._id,
                lastModified: images[prev.index - 1].lastModified,
              };
            } else {
              console.log({
                src: images[images.length - 1].src,
                index: images.length - 1,
                _id: images[0]._id,
                lastModified: images[0].lastModified,
              });
              return {
                src: images[images.length - 1].src,
                index: images.length - 1,
                _id: images[0]._id,
                lastModified: images[0].lastModified,
              };
            }
          });
        }
      }
    }, 500);
  };

  const handleMouseMove = () => {
    setMouseMoved(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setMouseMoved(false);
    }, 1000);
  };

  const openTransferModal = (): void => {
    setShowModal(true);
  };

  const closeTransferModal = (): void => {
    setShowModal(false);
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (!user?._id || !displayedConv?._id) return;
      console.log("IMMMMMG DATAAAAAAAAAAAAAAA");
      console.log(imgData);
      const images = await fetchConvImagesAround(user._id, displayedConv._id, imgData._id);

      if (images) {
        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        console.log(images);
        setImages(images);
        setSelectedImg({
          src: imgData.src,
          index: images.findIndex((img) => img._id === imgData._id) || 0,
          _id: imgData._id,
          lastModified: imgData.lastModified,
        });
      }
    };

    setSelectedImg({
      src: imgData ? imgData.src : images[0].src,
      index: -1,
      _id: imgData ? imgData._id : images[0]._id,
      lastModified: imgData ? imgData.lastModified : images[0].lastModified,
    });

    fetchImages();
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  useEffect(() => {
    setImages([]);
    return () => {};
  }, [displayedConv]);

  useEffect(() => {
    if (selectedImg !== null) {
      console.log(selectedImg);
    }

    return () => {};
  }, [selectedImg]);

  return (
    <div
      className="ImageVisualizer"
      style={{
        backgroundImage: { selectedImg } ? `url(${selectedImg?.src})` : `url(${images[0].src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      //onClick={() => console.log(selectedImg)}
    >
      <div className="close-visualizer">
        {" "}
        <CloseCircle
          onClick={closeVisualizer}
          color={"white"}
          title={"Fermer"}
          height="3rem"
          width="3rem"
        />
      </div>
      <div
        className="slider"
        style={{
          background: "rgba(0, 0, 0, 0.5)" /* Dark overlay */,
          backdropFilter: "blur(15px)" /* Blur effect */,
        }}
      >
        <div className="top-right">
          <div className="transfer-button" onClick={openTransferModal}>
            <LogOutOutline
              color={"#FFFFFF"}
              title={"Transférer"}
              height="2rem"
              width="2rem"
              style={{ rotate: "-90deg" }}
            />
          </div>
          <div>
            <a href={selectedImg?.src} download={selectedImg?.src}>
              <DownloadOutline color={"#FFFFFF"} title={"Télécharger"} height="2rem" width="2rem" />
            </a>
          </div>
        </div>
        <div
          className="arrow"
          id="left-arrow"
          style={mouseMoved ? { opacity: 1 } : { opacity: 0 }}
          onClick={() => slideCarousel(false)}
        >
          <ArrowBackCircleOutline color={"white"} title={"Précédent"} height="4rem" width="4rem" />
        </div>
        <div className="image-visualiser-container">
          {selectedImg !== null && <img src={selectedImg.src} />}
        </div>
        <div
          className="arrow"
          id="right-arrow"
          style={mouseMoved ? { opacity: 1 } : { opacity: 0 }}
          onClick={() => slideCarousel(true)}
        >
          <ArrowForwardCircleOutline color={"white"} title={"Suivant"} height="4rem" width="4rem" />{" "}
        </div>
        <div className="thumbnails-container">
          {selectedImg !== null && (
            <div className="content" ref={thumbnailsRef}>
              {images.map((image, index) => {
                return (
                  <img
                    src={image.src}
                    onClick={() =>
                      handleImgClick({
                        src: image.src,
                        index,
                        _id: image._id,
                        lastModified: image.lastModified,
                      })
                    }
                    key={index + "-" + image}
                    style={index === selectedImg.index ? { filter: "brightness(1)" } : {}}
                  ></img>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <TransferModal closeModal={closeTransferModal} selectedImg={selectedImg?.src} />
      )}
    </div>
  );
}

export default ImageVizualizer;
