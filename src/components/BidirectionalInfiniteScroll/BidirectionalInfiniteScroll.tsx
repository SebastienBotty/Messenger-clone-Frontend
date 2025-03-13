import React, { useRef, useEffect, useState } from "react";

interface BidirectionalInfiniteScrollProps {
  children: React.ReactNode;
  dataLength: number;
  fetchOlder: () => void;
  fetchNewer: () => void;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  loaderOlder?: React.ReactNode;
  loaderNewer?: React.ReactNode;
  endMessageOlder?: React.ReactNode;
  endMessageNewer?: React.ReactNode;
  scrollableTarget?: string;
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  threshold?: number;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

const BidirectionalInfiniteScroll: React.FC<BidirectionalInfiniteScrollProps> = ({
  children,
  dataLength,
  fetchOlder,
  fetchNewer,
  hasMoreOlder,
  hasMoreNewer,
  loaderOlder = <h4>Chargement des messages plus anciens...</h4>,
  loaderNewer = <h4>Chargement des messages plus récents...</h4>,
  endMessageOlder = <p>Aucun message plus ancien</p>,
  endMessageNewer = <p>Vous êtes à jour</p>,
  scrollableTarget,
  className,
  style,
  height,
  threshold = 20,
  onScroll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [prevDataLength, setPrevDataLength] = useState(dataLength);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);

  // Surveiller le défilement
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Vérifier si on est proche du haut
    setIsAtTop(scrollTop < threshold);

    // Vérifier si on est proche du bas
    setIsAtBottom(scrollTop + clientHeight > scrollHeight - threshold);

    // Sauvegarder la position de défilement
    setScrollPosition(scrollTop);

    // Appeler le gestionnaire de défilement personnalisé si fourni
    if (onScroll) {
      onScroll(event);
    }
  };

  // Charger les messages plus anciens quand on atteint le haut

  useEffect(() => {});
  useEffect(() => {
    if (isAtTop && hasMoreOlder) {
      setPrevScrollHeight(scrollRef.current?.scrollHeight || 0);
      console.log("CALLED DANS BIDIRECTIONAL:" + hasMoreOlder);
      fetchOlder();
    }
  }, [isAtTop, hasMoreOlder, fetchOlder]);

  // Charger les messages plus récents quand on atteint le bas
  useEffect(() => {
    if (isAtBottom && hasMoreNewer) {
      fetchNewer();
    }
  }, [isAtBottom, hasMoreNewer, fetchNewer]);

  // Maintenir la position de défilement après chargement de messages plus anciens
  useEffect(() => {
    if (dataLength > prevDataLength && !isAtBottom) {
      const newScrollHeight = scrollRef.current?.scrollHeight || 0;
      const heightDifference = newScrollHeight - prevScrollHeight;

      if (heightDifference > 0 && scrollRef.current) {
        scrollRef.current.scrollTop = scrollPosition + heightDifference;
      }
    }

    setPrevDataLength(dataLength);
  }, [dataLength, prevDataLength, prevScrollHeight, scrollPosition, isAtBottom]);

  return (
    <div
      id={scrollableTarget}
      ref={scrollRef}
      className={className}
      style={{
        overflow: "auto",
        height: height || "100%",
        ...style,
      }}
      onScroll={handleScroll}
    >
      {hasMoreOlder ? loaderOlder : endMessageOlder}

      {children}

      {hasMoreNewer ? loaderNewer : endMessageNewer}
    </div>
  );
};

export default BidirectionalInfiniteScroll;
