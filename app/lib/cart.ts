import {createCartComponents} from '@shopify/hydrogen/react';
import type {cartHandlers} from './cart.server';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
export const {CartProvider, useCart, useCartForm, useCartActions} =
  createCartComponents<typeof cartHandlers>();

export function useStorefrontCart() {
  // cartHandlers always selects the application's extra gift-card and bundle fields.
  return useCart((state) => state.data) as unknown as CartApiQueryFragment & {
    isOptimistic?: boolean;
  };
}
