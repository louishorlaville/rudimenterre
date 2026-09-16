import type { ProductVariantFragment } from "storefrontapi.generated";
import { Image } from "@shopify/hydrogen";
import { useRef } from "react";

type ProductImageData = Omit<
  NonNullable<ProductVariantFragment["image"]>,
  "__typename"
>;

export function ProductImage({
  image,
  previousImage,
  preloadImages = [],
  onPrevious,
  onNext,
  onFullscreen,
  hasMultipleImages = false,
  animationDirection = "next",
}: {
  image: ProductImageData | null | undefined;
  previousImage?: ProductImageData | null;
  preloadImages?: ProductImageData[];
  onPrevious?: () => void;
  onNext?: () => void;
  onFullscreen?: () => void;
  hasMultipleImages?: boolean;
  animationDirection?: "next" | "previous";
}) {
  const imageFrame = useRef<HTMLDivElement>(null);

  if (!image) {
    return <div className="product-image" />;
  }

  return (
    <div className="product-image product-image--interactive" ref={imageFrame}>
      <div className="product-image__preload" aria-hidden="true">
        {preloadImages
          .filter((preloadImage) => preloadImage.url !== image.url)
          .map((preloadImage) => (
            <Image
              alt=""
              data={preloadImage}
              key={preloadImage.id || preloadImage.url}
              loading="eager"
              decoding="async"
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          ))}
      </div>
      <div
        key={`${image.id}-${previousImage?.id || "initial"}-${animationDirection}`}
        className={`product-image__track${previousImage ? ` product-image__track--${animationDirection}` : ""}`}
      >
        {previousImage && animationDirection === "previous" ? (
          <Image
            alt={image.altText || "Product Image"}
            className="product-image__media"
            data={image}
            key={`active-${image.id}`}
            loading="eager"
            sizes="(min-width: 45em) 50vw, 100vw"
          />
        ) : previousImage ? (
          <Image
            alt={previousImage.altText || "Product Image"}
            className="product-image__media"
            data={previousImage}
            key={`previous-${previousImage.id}`}
            loading="eager"
            sizes="(min-width: 45em) 50vw, 100vw"
          />
        ) : null}
        {previousImage && animationDirection === "previous" ? (
          <Image
            alt={previousImage.altText || "Product Image"}
            className="product-image__media"
            data={previousImage}
            key={`previous-${previousImage.id}`}
            loading="eager"
            sizes="(min-width: 45em) 50vw, 100vw"
          />
        ) : (
          <Image
            alt={image.altText || "Product Image"}
            className="product-image__media"
            data={image}
            key={`active-${image.id}`}
            loading="eager"
            sizes="(min-width: 45em) 50vw, 100vw"
          />
        )}
      </div>
      {hasMultipleImages ? (
        <>
          <button
            className="product-image__arrow product-image__arrow--previous"
            type="button"
            onClick={onPrevious}
            aria-label="Afficher la photo précédente"
          >
            ‹
          </button>
          <button
            className="product-image__arrow product-image__arrow--next"
            type="button"
            onClick={onNext}
            aria-label="Afficher la photo suivante"
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
        aria-label="Afficher l’image en plein écran"
      >
        ⛶
      </button>
    </div>
  );
}
