import type {StorefrontLocale} from './i18n';

const POLICY_TITLES: Record<string, Record<StorefrontLocale, string>> = {
  'privacy-policy': {fr: 'Politique de confidentialité', en: 'Privacy Policy'},
  'terms-of-service': {fr: 'Conditions générales de vente', en: 'Terms of Service'},
  'refund-policy': {fr: 'Politique de remboursement', en: 'Refund Policy'},
  'shipping-policy': {fr: 'Politique de livraison', en: 'Shipping Policy'},
  'subscription-policy': {fr: 'Politique d’abonnement', en: 'Subscription Policy'},
};

export function policyTitle(handle: string, locale: StorefrontLocale, fallback: string) {
  return POLICY_TITLES[handle]?.[locale] ?? fallback;
}
