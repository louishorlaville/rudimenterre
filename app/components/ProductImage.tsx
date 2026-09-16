import type { ProductVariantFragment } from "storefrontapi.generated";
import { Image } from "@shopify/hydrogen";
import type { KeyboardEvent, PointerEvent } from "react";
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
  const zoomFrame = useRef<number>();
  const zoomMedia = useRef<HTMLImageElement | null>(null);
  const scrolling = useRef(false);
  const pointer = useRef({
    id: 0,
    startX: 0,
    startY: 0,
    startScroll: 0,
    dragging: false,
  });
  const [frameWidth, setFrameWidth] = useState(0);
  const [fullscreenSize, setFullscreenSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const activeImage = images[activeIndex] || images[0];
  const imageRatio =
    activeImage?.width && activeImage?.height
      ? activeImage.width / activeImage.height
      : 1;
  const frameHeight = frameWidth ? frameWidth / imageRatio : undefined;
  const zoomSourceWidth = activeImage?.width || 6400;
  const zoomSrcSetStep = Math.max(1, Math.floor(zoomSourceWidth / 16));
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resetZoom = (immediate = false) => {
    if (zoomFrame.current !== undefined) {
      window.cancelAnimationFrame(zoomFrame.current);
      zoomFrame.current = undefined;
    }
    const media = zoomMedia.current;
    if (!media) return;
    if (immediate) media.style.transition = "none";
    media.style.setProperty("--zoom-scale", "1");
    media.classList.remove("is-zoomed");
  };

  const followZoom = (event: PointerEvent<HTMLDivElement>) => {
    const carousel = track.current;
    if (
      event.pointerType !== "mouse" ||
      event.buttons !== 0 ||
      document.fullscreenElement !== imageFrame.current ||
      pointer.current.id !== 0 ||
      scrolling.current ||
      !carousel
    )
      return;
    const { clientX, clientY } = event;
    if (zoomFrame.current !== undefined)
      window.cancelAnimationFrame(zoomFrame.current);
    zoomFrame.current = window.requestAnimationFrame(() => {
      zoomFrame.current = undefined;
      const slide = carousel.children[activeIndex] as HTMLElement | undefined;
      const media = slide?.querySelector("img");
      if (!slide || !media || !media.naturalWidth || !media.naturalHeight)
        return;
      // Measure the untransformed slide: object-fit can leave large empty margins.
      const bounds = slide.getBoundingClientRect();
      if (Math.abs(bounds.left - carousel.getBoundingClientRect().left) > 1)
        return;
      const ratio = media.naturalWidth / media.naturalHeight;
      const width = Math.min(bounds.width, bounds.height * ratio);
      const height = width / ratio;
      const left = bounds.left + (bounds.width - width) / 2;
      const top = bounds.top + (bounds.height - height) / 2;
      if (
        clientX < left ||
        clientX > left + width ||
        clientY < top ||
        clientY > top + height
      ) {
        resetZoom();
        return;
      }
      zoomMedia.current = media;
      media.style.removeProperty("transition");
      media.style.setProperty(
        "--zoom-x",
        `${((clientX - bounds.left) / bounds.width) * 100}%`,
      );
      media.style.setProperty(
        "--zoom-y",
        `${((clientY - bounds.top) / bounds.height) * 100}%`,
      );
      media.style.setProperty("--zoom-scale", "2");
      media.classList.add("is-zoomed");
    });
  };

  useEffect(() => {
    const updateFullscreen = () => {
      resetZoom(true);
      setFullscreenSize(
        imageFrame.current && document.fullscreenElement === imageFrame.current
          ? { width: window.innerWidth, height: window.innerHeight }
          : null,
      );
      // A fullscreen/viewport resize changes the snap offsets without changing the index.
      const carousel = track.current;
      if (carousel)
        carousel.scrollTo({
          left: activeIndex * carousel.clientWidth,
          behavior: "instant",
        });
    };
    document.addEventListener("fullscreenchange", updateFullscreen);
    window.addEventListener("resize", updateFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreen);
      window.removeEventListener("resize", updateFullscreen);
      resetZoom(true);
    };
  }, [activeIndex]);

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
    resetZoom(true);
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
    scrolling.current = false;
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
    resetZoom(true);
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
      onPointerMove={(event) => {
        if ((event.target as HTMLElement).closest("button")) resetZoom();
      }}
    >
      <div
        className="product-image__track"
        ref={track}
        onScroll={() => {
          scrolling.current = true;
          resetZoom(true);
          if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
          scrollTimeout.current = window.setTimeout(settle, 90);
        }}
        onPointerDown={(event) => {
          const carousel = track.current;
          if (!carousel || event.button !== 0) return;
          resetZoom(true);
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
          followZoom(event);
          const carousel = track.current;
          if (
            !carousel ||
            pointer.current.id === 0 ||
            pointer.current.id !== event.pointerId
          )
            return;
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
        onPointerLeave={() => resetZoom()}
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
              srcSetOptions={
                fullscreenSize && index === activeIndex
                  ? {
                      intervals: Math.min(16, zoomSourceWidth),
                      startingWidth: Math.max(
                        1,
                        zoomSourceWidth - 15 * zoomSrcSetStep,
                      ),
                      incrementSize: zoomSrcSetStep,
                      placeholderWidth: 100,
                    }
                  : undefined
              }
              sizes={
                fullscreenSize && index === activeIndex
                  ? `${Math.min(image.width || Infinity, 2 * Math.min(fullscreenSize.width, fullscreenSize.height * imageRatio))}px`
                  : "(min-width: 45em) 50vw, 100vw"
              }
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
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m15 5-7 7 7 7" />
            </svg>
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
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
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
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
        </svg>
      </button>
    </div>
  );
}
