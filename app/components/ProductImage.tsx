import type { ProductVariantFragment } from "storefrontapi.generated";
import { Image } from "@shopify/hydrogen";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

type ProductImageData = Omit<
  NonNullable<ProductVariantFragment["image"]>,
  "__typename"
>;

export function ProductImage({
  images,
  activeIndex,
  onActiveIndexChange,
  locale = "fr",
  onFullscreen,
}: {
  images: ProductImageData[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  locale?: string;
  onFullscreen?: () => void;
}) {
  const imageFrame = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<number>();
  const pointer = useRef({
    id: 0,
    startX: 0,
    startY: 0,
    startScroll: 0,
    dragging: false,
  });
  const [frameWidth, setFrameWidth] = useState(0);
  const activeImage = images[activeIndex] || images[0];
  const imageRatio =
    activeImage?.width && activeImage?.height
      ? activeImage.width / activeImage.height
      : 1;
  const frameHeight = frameWidth ? frameWidth / imageRatio : undefined;
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const frame = imageFrame.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      setFrameWidth(entry.contentRect.width);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const carousel = track.current;
    if (!carousel) return;
    carousel.scrollTo({
      left: activeIndex * carousel.clientWidth,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [activeIndex]);

  useEffect(
    () => () => {
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    },
    [],
  );

  if (!activeImage) {
    return <div className="product-image" />;
  }

  const settle = () => {
    const carousel = track.current;
    if (!carousel?.clientWidth) return;
    const nextIndex = Math.max(
      0,
      Math.min(
        images.length - 1,
        Math.round(carousel.scrollLeft / carousel.clientWidth),
      ),
    );
    carousel.scrollTo({
      left: nextIndex * carousel.clientWidth,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
    if (nextIndex !== activeIndex) onActiveIndexChange(nextIndex);
  };

  const goTo = (index: number) => {
    const nextIndex = (index + images.length) % images.length;
    onActiveIndexChange(nextIndex);
  };

  const handleNavigationKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(images.length - 1);
    }
  };

  return (
    <div
      className="product-image product-image--interactive"
      ref={imageFrame}
      role="region"
      aria-roledescription="carousel"
      aria-label={locale === "fr" ? "Photos du produit" : "Product photos"}
      style={{
        aspectRatio: `${imageRatio}`,
        height: frameHeight ? `${frameHeight}px` : undefined,
      }}
    >
      <div
        className="product-image__track"
        ref={track}
        onScroll={() => {
          if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
          scrollTimeout.current = window.setTimeout(settle, 90);
        }}
        onPointerDown={(event) => {
          const carousel = track.current;
          if (!carousel || event.button !== 0) return;
          pointer.current = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScroll: carousel.scrollLeft,
            dragging: false,
          };
          carousel.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const carousel = track.current;
          if (!carousel || pointer.current.id !== event.pointerId) return;
          const deltaX = event.clientX - pointer.current.startX;
          const deltaY = event.clientY - pointer.current.startY;
          if (
            !pointer.current.dragging &&
            Math.abs(deltaX) > 6 &&
            Math.abs(deltaX) > Math.abs(deltaY)
          ) {
            pointer.current.dragging = true;
            carousel.classList.add("is-dragging");
          }
          if (!pointer.current.dragging) return;
          event.preventDefault();
          carousel.scrollLeft = pointer.current.startScroll - deltaX;
        }}
        onPointerUp={(event) => {
          const carousel = track.current;
          if (!carousel || pointer.current.id !== event.pointerId) return;
          carousel.releasePointerCapture(event.pointerId);
          carousel.classList.remove("is-dragging");
          pointer.current.id = 0;
          settle();
        }}
        onPointerCancel={(event) => {
          const carousel = track.current;
          if (!carousel || pointer.current.id !== event.pointerId) return;
          carousel.classList.remove("is-dragging");
          pointer.current.id = 0;
          settle();
        }}
      >
        {images.map((image, index) => (
          <div
            className="product-image__slide"
            key={image.id || image.url}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${images.length}`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              alt={
                image.altText ||
                (locale === "fr" ? "Photo du produit" : "Product photo")
              }
              className="product-image__media"
              data={image}
              loading={Math.abs(index - activeIndex) <= 1 ? "eager" : "lazy"}
              draggable={false}
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <>
          <button
            className="product-image__arrow product-image__arrow--previous"
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            onKeyDown={handleNavigationKey}
            aria-label={
              locale === "fr"
                ? "Afficher la photo précédente"
                : "Show previous photo"
            }
          >
            ‹
          </button>
          <button
            className="product-image__arrow product-image__arrow--next"
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            onKeyDown={handleNavigationKey}
            aria-label={
              locale === "fr" ? "Afficher la photo suivante" : "Show next photo"
            }
          >
            ›
          </button>
        </>
      ) : null}
      <button
        className="product-image__fullscreen"
        type="button"
        onClick={() => {
          if (imageFrame.current?.requestFullscreen) {
            void imageFrame.current.requestFullscreen();
          }
          onFullscreen?.();
        }}
        aria-label={
          locale === "fr"
            ? "Afficher l’image en plein écran"
            : "Show image fullscreen"
        }
      >
        ⛶
      </button>
    </div>
  );
}
