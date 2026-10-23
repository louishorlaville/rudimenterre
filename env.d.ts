/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    SHOPIFY_ADMIN_API_ACCESS_TOKEN?: string;
    SHOPIFY_ADMIN_CLIENT_ID?: string;
    SHOPIFY_ADMIN_CLIENT_SECRET?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
  }
}
