import { useLoaderData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/($locale).products.$handle";
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from "@shopify/hydrogen";
import { ProductPrice } from "~/components/ProductPrice";
import { ProductImage } from "~/components/ProductImage";
import { ProductForm } from "~/components/ProductForm";
import { redirectIfHandleIsLocalized } from "~/lib/redirect";
import "~/styles/product.css";

type ProductDetails = {
  eyebrow?: string;
  subtitle?: string;
  galleryCaption?: string;
  dimensions?: string;
  description?: string;
  characteristics?: string;
  delivery?: string;
};

function readProductDetails(value?: string | null): ProductDetails {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeRichText(value: string) {
  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n");
}

function readDimensions(description: string) {
  return description
    .match(
      /Dimensions\s*:\s*([\s\S]*?)(?:Tous les Cuicuis|All Cuicuis|$)/i,
    )?.[1]
    ?.trim()
    .replace(/\s*\n\s*/g, "\n");
}

export const meta: Route.MetaFunction = ({ data }) => {
  const locale = data?.locale ?? "fr";
  return [
    {
      title: `${data?.product.seo?.title || data?.product.title || "Rudimenterre"} — Rudimenterre`,
    },
    {
      name: "description",
      content:
        data?.product.seo?.description || data?.product.description || "",
    },
    {
      rel: "canonical",
      href: `/${locale}/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: Route.LoaderArgs) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error("Expected product handle to be defined");
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: product });

  return { product, locale: params.locale === "en" ? "en" : "fr" };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context, params }: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const { product, locale } = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const { title, description, descriptionHtml, images, dimensionsImage } =
    product;
  const details = readProductDetails(product.metafield?.value);
  const heroImage = selectedVariant?.image || images?.nodes[0];
  const [activeImage, setActiveImage] = useState(heroImage);
  const galleryImages = (images?.nodes ?? []).filter(
    (image) => image.url !== heroImage?.url,
  );
  const dimensions = details.dimensions || readDimensions(description);
  const summary =
    details.subtitle || description.match(/^.*?[.!?]/)?.[0] || description;

  return (
    <div className="product product--redesign product--desktop">
      <div className="product-gallery">
        <ProductImage image={activeImage} />
        {dimensions ? (
          <div className="product-specs">
            <div>
              <p className="product-section-label">
                {locale === "fr" ? "Dimensions" : "Dimensions"}
              </p>
              <div
                className="product-rich-text"
                dangerouslySetInnerHTML={{
                  __html: normalizeRichText(dimensions),
                }}
              />
            </div>
            {dimensionsImage?.reference?.image ? (
              <img
                className="product-specs__drawing"
                src={dimensionsImage.reference.image.url}
                alt={
                  dimensionsImage.reference.image.altText ||
                  "Dessin technique du Cuicui"
                }
                loading="lazy"
              />
            ) : (
              <svg
                className="product-specs__drawing"
                viewBox="0 0 240 160"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                aria-hidden="true"
              >
                <ellipse cx="108" cy="34" rx="13" ry="3" />
                <path d="M95 34v10c5 3 21 3 26 0V34M95 41c-34 3-55 14-61 26m87-26c34 3 53 14 60 26" />
                <ellipse cx="108" cy="68" rx="76" ry="13" />
                <path d="M33 68l4 10c22 15 120 15 142 0l5-10M38 80l2 17c20 14 113 14 135 0l3-17M41 100l4 32c4 23 121 23 126 0l4-32" />
                <path
                  d="M201 43v101m-5-101h10m-10 101h10M39 155h137m-137-5v10m137-10v10"
                  opacity=".6"
                />
              </svg>
            )}
          </div>
        ) : null}
      </div>
      <div className="product-main">
        <div className="product-main__intro">
          <p className="eyebrow">
            {details.eyebrow ||
              (locale === "fr"
                ? "Vase de cuisson modulaire"
                : "Modular cooking vessel")}
          </p>
          <h1>{title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <p className="product-subtitle">{summary}</p>
        </div>
        <div className="product-purchase">
          <ProductForm selectedVariant={selectedVariant} locale={locale} />
        </div>
        <div className="product-accordions">
          <details>
            <summary>
              {locale === "fr" ? "Description" : "Description"}{" "}
              <span aria-hidden="true">+</span>
            </summary>
            <div
              className="product-rich-text"
              dangerouslySetInnerHTML={{
                __html: normalizeRichText(
                  details.description || descriptionHtml,
                ),
              }}
            />
          </details>
          <details>
            <summary>
              {locale === "fr" ? "Caractéristiques" : "Details"}{" "}
              <span aria-hidden="true">+</span>
            </summary>
            {details.characteristics ? (
              <div
                className="product-rich-text"
                dangerouslySetInnerHTML={{
                  __html: normalizeRichText(details.characteristics),
                }}
              />
            ) : (
              <p>
                {locale === "fr"
                  ? "Pièce en céramique fabriquée à la main sur commande."
                  : "Handmade ceramic piece, made to order."}
              </p>
            )}
          </details>
          <details>
            <summary>
              {locale === "fr" ? "Livraison" : "Shipping"}{" "}
              <span aria-hidden="true">+</span>
            </summary>
            {details.delivery ? (
              <div
                className="product-rich-text"
                dangerouslySetInnerHTML={{
                  __html: normalizeRichText(details.delivery),
                }}
              />
            ) : (
              <p>
                {locale === "fr"
                  ? "Livraison soignée et paiement sécurisé."
                  : "Careful delivery and secure payment."}
              </p>
            )}
          </details>
        </div>
      </div>
      {galleryImages.length > 0 ? (
        <div className="product-gallery__thumbs">
          {galleryImages.slice(0, 3).map((image) => (
            <button
              key={image.id || image.url}
              className={`product-gallery__thumb${activeImage?.url === image.url ? " is-active" : ""}`}
              type="button"
              onClick={() => setActiveImage(image)}
              aria-label={`Afficher ${image.altText || title}`}
              aria-pressed={activeImage?.url === image.url}
            >
              <img
                src={image.url}
                alt=""
                width={image.width || undefined}
                height={image.height || undefined}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
      {details.galleryCaption ? (
        <p className="product-gallery__caption">{details.galleryCaption}</p>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description: product.description,
            image: selectedVariant?.image?.url,
            sku: selectedVariant?.sku,
            offers: selectedVariant
              ? {
                  "@type": "Offer",
                  price: selectedVariant.price.amount,
                  priceCurrency: selectedVariant.price.currencyCode,
                  availability: selectedVariant.availableForSale
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                }
              : undefined,
          }),
        }}
      />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || "0",
              vendor: product.vendor,
              variantId: selectedVariant?.id || "",
              variantTitle: selectedVariant?.title || "",
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    metafield(namespace: "custom", key: "product_details") {
      value
    }
    dimensionsImage: metafield(namespace: "custom", key: "dimensions_image") {
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
