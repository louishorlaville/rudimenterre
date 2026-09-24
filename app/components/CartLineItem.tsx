import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {StorefrontLocale} from '~/lib/i18n';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
  locale,
  pendingLineIds,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
  locale: StorefrontLocale;
  pendingLineIds: ReadonlySet<string>;
}) {
  const {id, merchandise} = line;
  const {product, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  const visibleOptions = selectedOptions.filter(
    (option) => option.value !== 'Default Title',
  );
  const unitPrice = line.cost?.amountPerQuantity ?? merchandise.price;
  const displayedPrice =
    line.isOptimistic || pendingLineIds.has(id)
      ? {
          ...unitPrice,
          amount: multiplyMoney(unitPrice.amount, line.quantity),
        }
      : line.cost?.totalAmount;

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-inner">
        {image && (
          <Image
            alt={product.title}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
          />
        )}

        <div className="cart-line-copy">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <p className="cart-line-title">
              <strong>{product.title}</strong>
            </p>
          </Link>
          <ProductPrice
            price={displayedPrice}
            label={locale === 'fr' ? 'Prix' : 'Price'}
          />
          {visibleOptions.length > 0 && (
            <ul className="cart-line-options">
              {visibleOptions.map((option) => (
                <li key={option.name}>
                  <small>
                    {option.name}: {option.value}
                  </small>
                </li>
              ))}
            </ul>
          )}
          <CartLineQuantity line={line} locale={locale} layout={layout} />
        </div>
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            {locale === 'fr' ? 'Articles avec' : 'Line items with'}{' '}
            {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
                locale={locale}
                pendingLineIds={pendingLineIds}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function multiplyMoney(amount: string, quantity: number) {
  const decimals = amount.split('.')[1]?.length ?? 0;
  return (Number(amount) * quantity).toFixed(decimals);
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({
  line,
  locale,
  layout,
}: {
  line: CartLine;
  locale: StorefrontLocale;
  layout: CartLayout;
}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity">
      <small>
        {locale === 'fr' ? 'Quantité' : 'Quantity'}
        {layout === 'page' ? ` : ${quantity}` : ''}
      </small>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label={
            locale === 'fr'
              ? `Diminuer la quantité de ${line.merchandise.product.title}`
              : `Decrease quantity of ${line.merchandise.product.title}`
          }
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span aria-hidden="true">&#8722;</span>
        </button>
      </CartLineUpdateButton>
      {layout === 'aside' && (
        <span className="cart-line-quantity-value" aria-live="polite">
          {quantity}
        </span>
      )}
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label={
            locale === 'fr'
              ? `Augmenter la quantité de ${line.merchandise.product.title}`
              : `Increase quantity of ${line.merchandise.product.title}`
          }
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <span aria-hidden="true">&#43;</span>
        </button>
      </CartLineUpdateButton>
      <CartLineRemoveButton
        lineIds={[lineId]}
        disabled={!!isOptimistic}
        locale={locale}
      />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
  locale,
}: {
  lineIds: string[];
  disabled: boolean;
  locale: StorefrontLocale;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className="cart-line-remove" disabled={disabled} type="submit">
        {locale === 'fr' ? 'Retirer' : 'Remove'}
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
