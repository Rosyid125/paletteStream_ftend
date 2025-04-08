// src/components/ImageCarousel.jsx
import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "./../api/axiosInstance";

const formatImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg";
  const cleanedPath = imagePath.replace(/\\/g, "/");

  if (cleanedPath.startsWith("http") || cleanedPath.startsWith("/")) {
    return cleanedPath;
  }

  const baseUrl = api.defaults.baseURL.endsWith("/") ? api.defaults.baseURL.slice(0, -1) : api.defaults.baseURL;
  const relativePath = cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath;
  return `${baseUrl}/${relativePath}`;
};

export function ImageCarousel({ images = [], title = "Post image", className }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const openModal = (index) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const modalNext = () => {
    setModalIndex((prev) => (prev + 1) % images.length);
  };

  const modalPrev = () => {
    setModalIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!images || images.length === 0) {
    return (
      <div className={cn("aspect-video w-full bg-muted flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video w-full", className)}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((imageSrc, index) => (
            <div className="relative flex-[0_0_100%] h-full" key={index}>
              <img src={formatImageUrl(imageSrc)} alt={`${title} - ${index + 1} of ${images.length}`} className="object-cover w-full h-full cursor-zoom-in" loading={index === 0 ? "eager" : "lazy"} onClick={() => openModal(index)} />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity disabled:opacity-30"
            onClick={scrollPrev}
            disabled={!emblaApi?.canScrollPrev()}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity disabled:opacity-30"
            onClick={scrollNext}
            disabled={!emblaApi?.canScrollNext()}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5">
            {scrollSnaps.map((_, index) => (
              <button key={index} onClick={() => scrollTo(index)} className={cn("p-0.5 rounded-full", index === selectedIndex ? "opacity-100" : "opacity-50 hover:opacity-75")} aria-label={`Go to image ${index + 1}`}>
                <Circle className={`h-1.5 w-1.5 fill-white ${index === selectedIndex ? "bg-white" : "bg-transparent"} rounded-full`} />
              </button>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <img src={formatImageUrl(images[modalIndex])} alt={`Image ${modalIndex + 1}`} className="max-w-full max-h-full object-contain cursor-zoom-out" onClick={closeModal} />
          <button onClick={closeModal} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-1 rounded-full" aria-label="Close image">
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  modalPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  modalNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
