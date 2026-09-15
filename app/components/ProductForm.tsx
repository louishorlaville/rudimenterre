import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  selectedVariant,
  locale = 'fr',
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  locale?: string;
}) {
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="product-form">
      <div
        className="product-quantity"
        aria-label={locale === 'fr' ? 'Quantité' : 'Quantity'}
      >
        <span>{locale === 'fr' ? 'Quantité' : 'Quantity'}</span>
        <div className="product-quantity__controls">
          <button
            type="button"
            disabled={quantity === 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            aria-label={
              locale === 'fr' ? 'Diminuer la quantité' : 'Decrease quantity'
            }
          >
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            aria-label={
              locale === 'fr' ? 'Augmenter la quantité' : 'Increase quantity'
            }
          >
            +
          </button>
        </div>
      </div>
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [{merchandiseId: selectedVariant.id, quantity, selectedVariant}]
            : []
        }
      >
        {selectedVariant?.availableForSale
          ? locale === 'fr'
            ? 'Ajouter au panier'
            : 'Add to cart'
          : locale === 'fr'
            ? 'Épuisé'
            : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}
