# Shopify content model

Create a storefront-accessible metaobject definition named `Editorial page` with API type `editorial_page`.

| Field | Key | Shopify type | Required | Translatable |
| --- | --- | --- | --- | --- |
| Internal name | `internal_name` | Single-line text | Yes | No |
| Eyebrow | `eyebrow` | Single-line text | Yes | Yes |
| Page title | `title` | Single-line text | Yes | Yes |
| Introduction | `intro` | Multi-line text | Yes | Yes |
| Hero media | `hero_media` | File reference, images only | No | Alt text must be localized |
| SEO description | `seo_description` | Multi-line text | Yes | Yes |

Create entries with these handles: `project`, `steam`, `garden`, `making`, `thermal`, `distillation`, `creator`, `jury`, `adopt`, and `shipping`. The code contains mockup-derived preview fallbacks; Shopify values override the key hero and SEO fields once entries are published to the Hydrogen storefront. “Pour Apprendre” is intentionally excluded.

The page layouts and section order remain code-owned. Add new field types only after the corresponding component is designed in both desktop and mobile states. This keeps client editing safe without creating an unrestricted page builder.

Translate every entry, product, menu and policy using Shopify’s translation workflow. A page is launch-ready only when its French and English title, introduction, SEO description and media alt text are complete.
