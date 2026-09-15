import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  selectedVariant,
  locale = 'fr',
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  locale?: string;
}) {
  const {open} = useAside();

  return (
    <div className="product-form">
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
            : []
        }
      >
        {selectedVariant?.availableForSale
          ? locale === 'fr' ? 'Ajouter au panier' : 'Add to cart'
          : locale === 'fr' ? 'Épuisé' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}
