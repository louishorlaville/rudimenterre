# Shopify content model

Create a storefront-accessible metaobject definition named `Editorial page` with API type `editorial_page`.

| Field | Key | Shopify type | Required | Translatable |
| --- | --- | --- | --- | --- |
| Internal name | `internal_name` | Single-line text | Yes | No |
| Eyebrow | `eyebrow` | Single-line text | When supported below | Yes |
| Page title | `title` | Single-line text | Yes | Yes |
| Introduction | `intro` | Multi-line text | When supported below | Yes |
| Hero media | `hero_media` | File reference, images only | No | Alt text must be localized |
| SEO description | `seo_description` | Multi-line text | Yes | Yes |

Create entries with these handles: `project`, `steam`, `garden`, `making`, `thermal`, `distillation`, `creator`, `jury`, `adopt`, `shipping`, and `vadrouille`. The code contains mockup-derived preview fallbacks; Shopify values override supported hero and SEO fields once entries are published to the Hydrogen storefront. “Pour Apprendre” is intentionally excluded.

The page layouts and section order remain code-owned. Add new field types only after the corresponding component is designed in both desktop and mobile states. This keeps client editing safe without creating an unrestricted page builder.

Translate every entry, product, menu and policy using Shopify’s translation workflow. A page is launch-ready only when its French and English title, supported text fields, SEO description and supported media alt text are complete.

## Editable slots by page

The owner approved using existing slots for the batch 5 repair (2026-10-26).
A dash means the current layout has no suitable slot: leave that field unset for
this page. Do not publish text expecting a new section or replace instructional
images with a hero image.

| Handle | Title | Introduction | Eyebrow | Hero media |
| --- | --- | --- | --- | --- |
| project | Hero H1 | Subtitle beside the flags | Project introduction heading | Opening banner |
| steam | Hero H1 | Hero subtitle | — | Opening banner |
| garden | Opening H1 | Opening question | — | —; historical/modern comparison images stay code-owned |
| making | Hero H1 | — | — | Opening banner |
| thermal | Hero H1 | Question below the banner | Hero slogan | Opening banner |
| distillation (FR) | Hero H1 | Question below the banner | Hero slogan | Opening banner |
| distillation (EN) | Template H1 | Template introduction | Template eyebrow | Template banner |
| creator | Hero H1 | Story introduction heading | Hero slogan | Family banner |
| jury | Hero H1 | Award subtitle | Jury mention band | Opening banner |
| adopt | Hero H1 | Hero introduction | Choice prompt | Opening banner |
| shipping | Hero H1 | Shipping announcement | Suffix inside the title | Opening banner |
| vadrouille | Hero H1 | — | — | Opening banner |

Published non-blank values replace only these slots. Missing/empty/whitespace-only
values preserve the layout's existing localized copy, including its line breaks
and emphasis. A missing entry or CMS request failure also preserves that fallback.
Sections, body text, diagrams, decorative images and ordering remain code-owned.
CMS text is rendered as text, not interpreted as HTML. Hero media uses its localized
alt text when supplied; retain the existing alternative when it is absent.

The loader retains published text separately in `content.heroOverrides` so each
specialized layout can preserve its original rich fallback when a field is absent.
It also resolves `content.title` and `content.seoDescription` for metadata. A
published title therefore reaches both the visible H1 and the SEO title (shipping
keeps its separate title suffix). Without a published title, existing layout and
registry SEO wording are preserved; some use different descriptive wording.

Run `npm run check:editorial` for mocked loader-to-render and metadata checks on
all eleven pages in both languages, including blank content, missing/unsupported
media and CMS failures. It does not publish metaobjects or contact Shopify.
