# Shopify newsletter setup

The French and English `/pages/newsletter` forms save subscribers to Shopify Customers.
Existing customers are matched by email, preserving account details and existing tags.
Submission records `SUBSCRIBED`, `SINGLE_OPT_IN` and the server consent timestamp.
This is single opt-in: no confirmation email is sent by the storefront. Do not rely
on the store's double opt-in setting to change this API flow.

## Enable subscriptions

1. Configure a server-side Shopify Admin API credential with `write_customers`
   and access to protected customer email data. This is separate from the public
   Storefront API token. Never expose it through a `PUBLIC_` environment variable.
2. For a Dev Dashboard app installed on a store in the same Shopify organization,
   set `SHOPIFY_ADMIN_CLIENT_ID` and `SHOPIFY_ADMIN_CLIENT_SECRET` in local
   `.env` and Oxygen. The server obtains an access token and renews it before
   expiry; never paste a temporary token into production configuration. The existing
   `PUBLIC_STORE_DOMAIN` must point to that `*.myshopify.com` store.
   An existing legacy app can instead use `SHOPIFY_ADMIN_API_ACCESS_TOKEN`.
   Client credentials take precedence when configured. For a client's store in a
   different organization, use an OAuth installation flow instead.
3. Set the existing `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and
   `SESSION_SECRET` in both environments. Restart locally and redeploy Oxygen.
4. Test with an email address you control. Confirm its customer record shows email
   marketing as subscribed, and verify the tags below. Also test an existing customer
   and confirm their other tags and account details remain intact.

Each IP gets one attempt per minute and five per hour in a separate newsletter
namespace. Missing configuration or unavailable spam protection blocks submission.

## Send newsletters

Open Shopify Messaging in Shopify admin (formerly Shopify Email). Configure and
authenticate the sender email/domain before sending. Create customer segments
using email subscription status AND the relevant tags:

| Purpose | Tag |
| --- | --- |
| Website newsletter | `newsletter` |
| French / English | `newsletter:language:fr` / `newsletter:language:en` |
| Recipes | `newsletter:interest:recipes` |
| Workshops | `newsletter:interest:workshops` |
| Cuicui news | `newsletter:interest:news` |
| No selection | `newsletter:interest:general` |

Tags accumulate on repeat sign-ups; this form adds subscriptions and interests,
and is not a preference editor. Signed-in customers can edit their subscription,
topics and email language on `/account/profile`. Saving there replaces the known
newsletter language/topic tags while preserving unrelated tags. Unchecking the
email subscription opts out of all email marketing; order emails remain active.
Always filter campaigns by current email marketing
subscription status, since tags remain when someone unsubscribes. Use Shopify's
unsubscribe link in every campaign. Create separate French and English campaigns.

A welcome automation can be configured in Shopify Messaging after testing the
subscription trigger. The storefront does not send campaigns or welcome messages.

Official references:
- https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant
- https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/customerSet
- https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/customerEmailMarketingConsentUpdate
- https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/setup

## Verify code

`node scripts/check-newsletter.mjs` checks validation, consent, tags, rate limits,
and mocked API failures without creating customers or sending messages.
