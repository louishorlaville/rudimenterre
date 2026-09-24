import type {CustomerFragment} from 'customer-accountapi.generated';

export type AccountLocale = 'fr' | 'en';
export type AccountContext = {
  customer: CustomerFragment;
  locale: AccountLocale;
};

export const accountLocale = (value?: string): AccountLocale =>
  value === 'en' ? 'en' : 'fr';

export const accountPath = (locale: AccountLocale, path: string) =>
  `/${locale}${path}`;

export function accountStatus(status: string, locale: AccountLocale) {
  const labels: Record<string, [string, string]> = {
    PAID: ['Payée', 'Paid'],
    PENDING: ['En attente', 'Pending'],
    AUTHORIZED: ['Autorisée', 'Authorized'],
    EXPIRED: ['Expirée', 'Expired'],
    PARTIALLY_PAID: ['Partiellement payée', 'Partially paid'],
    PARTIALLY_REFUNDED: ['Partiellement remboursée', 'Partially refunded'],
    REFUNDED: ['Remboursée', 'Refunded'],
    VOIDED: ['Annulée', 'Voided'],
    FULFILLED: ['Expédiée', 'Fulfilled'],
    PARTIALLY_FULFILLED: ['Partiellement expédiée', 'Partially fulfilled'],
    UNFULFILLED: ['Non expédiée', 'Unfulfilled'],
    SUCCESS: ['Livrée', 'Delivered'],
    IN_TRANSIT: ['En transit', 'In transit'],
    LABEL_PRINTED: ['Étiquette créée', 'Label created'],
    LABEL_PURCHASED: ['Étiquette achetée', 'Label purchased'],
    FAILURE: ['Échec de livraison', 'Delivery failed'],
    ERROR: ['Erreur de livraison', 'Delivery error'],
    CANCELLED: ['Annulée', 'Cancelled'],
    CANCELED: ['Annulée', 'Canceled'],
    OUT_FOR_DELIVERY: ['En cours de livraison', 'Out for delivery'],
    DELIVERED: ['Livrée', 'Delivered'],
    PICKED_UP: ['Récupérée', 'Picked up'],
    ATTEMPTED_DELIVERY: ['Tentative de livraison', 'Delivery attempted'],
  };

  return (
    labels[status.toUpperCase()]?.[locale === 'fr' ? 0 : 1] ??
    status.replace(/_/g, ' ')
  );
}
