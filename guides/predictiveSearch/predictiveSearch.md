# Predictive search in this repository

Predictive search uses the existing [localized search route](../../app/routes/%28%24locale%29.search.tsx)
and [search page loader](../../app/pages/search/Page.tsx). This replaces the old
skeleton install recipe; no second route or POST action is needed.

[SearchFormPredictive](../../app/components/SearchFormPredictive.tsx) submits GET
requests to `/fr/search` or `/en/search` using `q`, `limit=5` and `predictive=true`.
The loader reads URL search parameters. Presence of `predictive` selects this mode
(even `predictive=false`); absent `limit` defaults to 10. Empty trimmed `q` returns
empty results without querying Shopify. The current handler converts `limit` with
`Number`; it does not clamp it, so keep callers on the supported fixed value.

[SearchResultsPredictive](../../app/components/SearchResultsPredictive.tsx) exposes
`items`, `total`, `term`, `state`, `inputRef`, `closeSearch` and optional `error`
to its render-prop consumer. Items are arrays for articles, collections, pages,
products and query suggestions. A caught upstream error resolves to that same
shape with zero results, the term and a localized error; it does not return a
regular-search connection or reject the recovered promise.

Resource links preserve locale and tracking; articles include both blog and
article handles. Suggested queries render a datalist. Full-search navigation
encodes the input with `URLSearchParams` and keeps the current locale.

The components are available building blocks. The current
[PageLayout](../../app/components/PageLayout.tsx) mounts cart/mobile asides, and
does **not** mount a predictive-search drawer. This guide does not claim an
end-to-end predictive UI is currently visible or add one. A future consumer must
render the exposed error instead of treating it as an ordinary empty result.

Use [search utilities](../../app/lib/search.ts) as the result contract and run
`npm run check:catalog` for offline callbacks, destination and loader recovery
checks. See [regular search](../search/search.md) and
[verification](../verification.md) for build/browser/integration boundaries.
