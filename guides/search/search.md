# Search in this repository

The search route already exists. The old skeleton installation recipe has been
replaced; do not create `/routes/search.tsx` or copy its discarded-promise catch.

| Source | Responsibility |
| --- | --- |
| [Localized route](../../app/routes/%28%24locale%29.search.tsx) | Thin exports for `/fr/search` and `/en/search` |
| [Search page](../../app/pages/search/Page.tsx) | Loader, regular/predictive queries, metadata and regular results UI |
| [Search form](../../app/components/SearchForm.tsx) | GET form; no action means submit to the current localized route |
| [Results](../../app/components/SearchResults.tsx) | Products, pages and articles |
| [Search utilities](../../app/lib/search.ts) | Discriminated result types, empty states and tracking URL encoding |
| [Pagination](../../app/components/Pagination.tsx) | Cursor/direction GET links and accumulated router state |

Regular requests use `q`, with `cursor` and `direction=previous` for pagination.
The loader parses `new URL(request.url).searchParams`, not `request.formData()`.
Products are requested in pages of eight; articles/pages have their own query
limits. `result.total` counts returned nodes, not all matches in the store.

The loader awaits the selected search operation inside `try/catch`. A failure
resolves to `{type: 'regular', term, error, result}` with a localized error and
empty connection-shaped results. It preserves the trimmed query on failure and
hides the contradictory no-results message. Attach recovery to the promise being
returned, or catch around its awaited value; catching a detached promise does not
recover the original rejection. See the actual loader for the complete contract.

Result destinations retain `/fr` or `/en`: products at
`/locale/products/handle`, pages at `/locale/pages/handle`, and articles at
`/locale/blogs/blog-handle/article-handle`. The query requests `article.blog.handle`.
`urlWithTrackingParams` encodes raw `q` once through `URLSearchParams`, then appends
Shopify tracking parameters. Do not pre-encode the search term.

[Predictive search](../predictiveSearch/predictiveSearch.md) uses the same loader
with a presence-based `predictive` flag. Run `npm run check:catalog` for offline
link/query/recovery regressions; real navigation and provider behavior remain
[separate verification gates](../verification.md).
