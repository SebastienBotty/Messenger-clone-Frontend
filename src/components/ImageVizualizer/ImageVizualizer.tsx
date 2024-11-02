import React from "react";
import "./ImageVizualizer.css";
import { useRef, useState, useEffect } from "react";
import { ApiToken } from "./../../localStorage";

import {
  ArrowBackCircleOutline,
  ArrowForwardCircleOutline,
  CloseCircle,
  DownloadOutline,
  LogOutOutline,
} from "react-ionicons";
import { useDisplayedConvContext } from "../../screens/userLoggedIn/userLoggedIn";
import Modal from "..//Modal/Modal";
import { ImgS3DataType } from "../../typescript/types";

type SelectedImageType = {
  src: string;
  index: number;
};

type thumbnailsImgType = {
  name: string;
  src: string;
};
function ImageVizualizer({
  closeVisualizer,
  imgData,
}: {
  closeVisualizer: () => void;
  imgData: ImgS3DataType;
}) {
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  //const { imgData, setImgData } = useImgVisualizerInitialImgContext();
  const RESTAPIuri = process.env.REACT_APP_REST_API_URI;
  const { displayedConv } = useDisplayedConvContext();
  const [images, setImages] = useState<thumbnailsImgType[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  /*  const [selectedImg, setSelectedImg] = useState<SelectedImageType>(()=>{
    if (imgData) {
      return { src: imgData.src, index: 11 };
  }else{
    return { src: images[0], index: 0 };
  }}); */
  //const [selectedImg, setSelectedImg] = useState<SelectedImageType>({src: imgData?imgData.src:images[0].src, index: images.indexOf(imgData?imgData:images[0])});
  const [selectedImg, setSelectedImg] = useState<SelectedImageType | null>(
    null
  );
  const [translateValue, setTranslateValue] = useState<number>(0);
  const [mouseMoved, setMouseMoved] = useState<boolean>(false);
  let timeoutId: NodeJS.Timeout | null = null;

  const handleImgClick = (image: SelectedImageType) => {
    if (selectedImg !== null) {
      let indexDifference: number = image.index - selectedImg.index;
      if (thumbnailsRef.current) {
        console.log("précedent: " + selectedImg.index);

        console.log("new :" + image.index);
        console.log(indexDifference);
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

  const slideCarousel = (side: boolean) => {
    if (thumbnailsRef.current && selectedImg !== null) {
      if (side && selectedImg.index !== images.length - 1) {
        console.log("slide right");
        thumbnailsRef.current.style.transform = `translateX(${
          translateValue - 5
        }rem)`;
        setTranslateValue((prev) => prev - 5);
        setSelectedImg((prev) => {
          if (prev !== null) {
            return { src: images[prev.index + 1].src, index: prev.index + 1 };
          } else {
            return { src: images[0].src, index: 0 };
          }
        });
      } else if (!side && selectedImg.index !== 0) {
        console.log("slide left");
        thumbnailsRef.current.style.transform = `translateX(${
          translateValue + 5
        }rem)`;
        setTranslateValue((prev) => prev + 5);
        setSelectedImg((prev) => {
          if (prev !== null) {
            return { src: images[prev.index - 1].src, index: prev.index - 1 };
          } else {
            return {
              src: images[images.length - 1].src,
              index: images.length - 1,
            };
          }
        });
      }
    }
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
      console.log(displayedConv?._id);
      if (displayedConv && imgData) {
        try {
          const response = await fetch(
            RESTAPIuri +
              "/file/conversationId/" +
              displayedConv._id +
              "/getConversationImages?fileName=" +
              imgData.name
          );
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          const jsonData = await response.json();
          console.log(jsonData);
          setImages(jsonData);
          setSelectedImg({
            src: imgData.src,
            index: Math.ceil(jsonData.length / 2),
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("An unknown error occurred");
          }
        }
      }
    };
    setSelectedImg({ src: imgData ? imgData.src : images[0].src, index: -1 });

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
        backgroundImage: { selectedImg }
          ? `url(${selectedImg?.src})`
          : `url(${images[0].src})`,
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
              <DownloadOutline
                color={"#FFFFFF"}
                title={"Télécharger"}
                height="2rem"
                width="2rem"
              />
            </a>
          </div>
        </div>
        <div
          className="arrow"
          id="left-arrow"
          style={mouseMoved ? { opacity: 1 } : { opacity: 0 }}
          onClick={() => slideCarousel(false)}
        >
          <ArrowBackCircleOutline
            color={"white"}
            title={"Précédent"}
            height="4rem"
            width="4rem"
          />
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
          <ArrowForwardCircleOutline
            color={"white"}
            title={"Suivant"}
            height="4rem"
            width="4rem"
          />{" "}
        </div>
        <div className="thumbnails-container">
          {selectedImg !== null && (
            <div className="content" ref={thumbnailsRef}>
              {images.map((image, index) => {
                return (
                  <img
                    src={image.src}
                    onClick={() => handleImgClick({ src: image.src, index })}
                    key={index + "-" + image}
                    style={
                      index === selectedImg.index
                        ? { filter: "brightness(1)" }
                        : {}
                    }
                  ></img>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <Modal closeModal={closeTransferModal} selectedImg={selectedImg?.src} />
      )}
    </div>
  );
}

export default ImageVizualizer;
