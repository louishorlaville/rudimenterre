# Product content model

The product template is intentionally code-owned. Shopify only supplies product data and one optional JSON metafield, so every product can use the same layout without creating a different template per SKU.

Create this product metafield in Shopify:

| Namespace | Key | Type | Purpose |
| --- | --- | --- | --- |
| `custom` | `product_details` | JSON | Editorial content shown in the product page accordions and gallery |

Example value:

```json
{
  "eyebrow": "Vase de cuisson modulaire",
  "subtitle": "Une céramique brute et ingénieuse pour mijoter, cuire, partager.",
  "galleryCaption": "Pensé pour durer. Imaginé pour être transmis.",
  "description": "<p>Le Cuicui accompagne les cuissons douces...</p>",
  "characteristics": "Terre cuite fabriquée au Québec. Couvercle inclus.",
  "dimensions": "Ø 24 cm\nHauteur 18 cm\n(2 modules)",
  "delivery": "Expédition sous 2 à 4 jours ouvrés. Emballage protecteur inclus."
}
```

Use the product title, price, inventory, SKU and product description in Shopify's native fields. Add all product photography to the product media gallery; the first available variant image is the large image and the next three images become the supporting tiles. Since each product has one model and one colour, do not create frontend selectors for those concepts. If Shopify requires variants operationally, keep a single default variant and use its inventory/price as the source of truth.

For French/English storefronts, translate the native product fields and the JSON values through Shopify's translation workflow. Keep the JSON keys identical in both languages. The frontend has safe fallbacks when the metafield is empty, so a product remains renderable while content is being completed.
