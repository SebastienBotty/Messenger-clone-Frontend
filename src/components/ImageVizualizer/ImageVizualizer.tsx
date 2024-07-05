import React from "react";
import "./ImageVizualizer.css";
import { useRef, useState, useEffect } from "react";

import {
  ArrowBackCircleOutline,
  ArrowForwardCircleOutline,
  CloseCircle,
} from "react-ionicons";
import { useShowImgVisualizerContext } from "../../screens/userLoggedIn/userLoggedIn";

type SelectedImageType = {
  src: string;
  index: number;
};
function ImageVizualizer() {
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const { showImgVisualizer, setShowImgVisualizer } = useShowImgVisualizerContext();
  const [images, setImages] = useState<string[]>([
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "téléchargement.jfif",
    "/images.jfif",
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "/images.jfif",
    "Screenshot_1.png",
    "/images.jfif",
    "téléchargement.jfif",
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "téléchargement.jfif",
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "Screenshot_1.png",
    "/images.jfif",
    "téléchargement.jfif",
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "téléchargement.jfif",
    "/images.jfif",
    "téléchargement.jfif",
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "Screenshot_1.png",
    "/images.jfif",
    "Screenshot_1.png",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "Screenshot_1.png",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "Screenshot_1.png",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "449156081_1527924744490084_5349935796791350274_n.jpg",
    "/images.jfif",
    "Screenshot_1.png",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "téléchargement.jfif",
    "/images.jfif",
    "téléchargement.jfif",
  ]); // TODO()
  const [selectedImg, setSelectedImg] = useState<SelectedImageType>({
    src: "/images.jfif",
    index: 10,
  });

  const [translateValue, setTranslateValue] = useState<number>(0);
  const [mouseMoved, setMouseMoved] = useState<boolean>(false);
  let timeoutId: NodeJS.Timeout | null = null;

  const handleImgClick = (image: SelectedImageType) => {
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
  };

  const slideCarousel = (side: boolean) => {
    if (thumbnailsRef.current) {
      if (side && selectedImg.index !== images.length - 1) {
        console.log("slide right");
        thumbnailsRef.current.style.transform = `translateX(${
          translateValue - 5
        }rem)`;
        setTranslateValue((prev) => prev - 5);
        setSelectedImg((prev) => {
          return { src: images[prev.index + 1], index: prev.index + 1 };
        });
      } else if (!side && selectedImg.index !== 0) {
        console.log("slide left");
        thumbnailsRef.current.style.transform = `translateX(${
          translateValue + 5
        }rem)`;
        setTranslateValue((prev) => prev + 5);
        setSelectedImg((prev) => {
          return { src: images[prev.index - 1], index: prev.index - 1 };
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

  const closeVisualizer = () => {
    setShowImgVisualizer(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <div
      className="ImageVisualizer"
      style={{
        backgroundImage: `url(${selectedImg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
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
        {" "}
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
          <img src={selectedImg.src} />
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
          <div className="content" ref={thumbnailsRef}>
            {images.map((image, index) => {
              return (
                <img
                  src={image}
                  onClick={() => handleImgClick({ src: image, index })}
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
        </div>
      </div>
    </div>
  );
}

export default ImageVizualizer;
