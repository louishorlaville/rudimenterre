import {useOptimisticCart, type OptimisticCart} from '@shopify/hydrogen';
import {Link, useLocation} from 'react-router';
import type {
  CartApiQueryFragment,
  MoneyFragment,
} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {localeFromPathname} from '~/lib/i18n';
import type {StorefrontLocale} from '~/lib/i18n';
import {useEffect, useRef} from 'react';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main cart-main--${layout} ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);
  const originalQuantities = new Map(
    (originalCart?.lines?.nodes ?? []).map((line) => [line.id, line.quantity]),
  );
  const pendingLineIds = new Set(
    (cart?.lines?.nodes ?? [])
      .filter((line) => originalQuantities.get(line.id) !== line.quantity)
      .map((line) => line.id),
  );
  const locale = localeFromPathname(useLocation().pathname);
  const {type: activeAside} = useAside();
  const sectionRef = useRef<HTMLElement>(null);
  const displayedSubtotal = getDisplayedSubtotal(cart, originalCart);

  useEffect(() => {
    if (
      layout === 'aside' &&
      activeAside === 'cart' &&
      document.activeElement === document.body
    ) {
      sectionRef.current
        ?.querySelector<HTMLElement>(
          cartHasItems ? '.cart-line a' : '.cart-empty a',
        )
        ?.focus();
    }
  }, [activeAside, cartHasItems, cart?.totalQuantity, layout]);

  return (
    <section
      ref={sectionRef}
      className={className}
      aria-label={
        locale === 'fr'
          ? layout === 'page'
            ? 'Page panier'
            : 'Panier'
          : layout === 'page'
            ? 'Cart page'
            : 'Cart drawer'
      }
    >
      <CartEmpty hidden={linesCount} layout={layout} locale={locale} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          {locale === 'fr' ? 'Articles du panier' : 'Cart items'}
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              // we do not render non-parent lines at the root of the cart
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                  locale={locale}
                  pendingLineIds={pendingLineIds}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && (
          <CartSummary
            cart={cart}
            layout={layout}
            locale={locale}
            displayedSubtotal={displayedSubtotal}
          />
        )}
      </div>
    </section>
  );
}

function getDisplayedSubtotal(
  cart: OptimisticCart<CartApiQueryFragment | null>,
  originalCart: CartApiQueryFragment | null,
): MoneyFragment | undefined {
  const currentLines = (cart?.lines?.nodes ?? []).filter(
    (line) =>
      !('parentRelationship' in line && line.parentRelationship?.parent),
  );
  const originalLines = (originalCart?.lines?.nodes ?? []).filter(
    (line) =>
      !('parentRelationship' in line && line.parentRelationship?.parent),
  );
  const originalById = new Map(originalLines.map((line) => [line.id, line]));
  const currentById = new Map(currentLines.map((line) => [line.id, line]));
  const hasPendingQuantityChange =
    originalById.size !== currentById.size ||
    originalLines.some(
      (line) => currentById.get(line.id)?.quantity !== line.quantity,
    );
  const originalSubtotal = originalCart?.cost?.subtotalAmount;

  if (!hasPendingQuantityChange || !originalSubtotal) {
    const subtotal = cart?.cost?.subtotalAmount;
    return subtotal?.amount && subtotal.currencyCode
      ? {amount: subtotal.amount, currencyCode: subtotal.currencyCode}
      : undefined;
  }

  let amount = Number(originalSubtotal.amount);

  for (const originalLine of originalLines) {
    const currentLine = currentById.get(originalLine.id);
    const unitAmount =
      Number(originalLine.cost.totalAmount.amount) / originalLine.quantity;
    amount +=
      ((currentLine?.quantity ?? 0) - originalLine.quantity) * unitAmount;
  }

  for (const currentLine of currentLines) {
    if (!originalById.has(currentLine.id)) {
      amount +=
        Number(
          currentLine.cost?.amountPerQuantity?.amount ??
            currentLine.merchandise.price.amount,
        ) * currentLine.quantity;
    }
  }

  const precision = Math.min(
    6,
    Math.max(
      originalSubtotal.amount.split('.')[1]?.length ?? 0,
      ...originalLines.map(
        (line) => line.cost.totalAmount.amount.split('.')[1]?.length ?? 0,
      ),
    ),
  );

  return {
    currencyCode: originalSubtotal.currencyCode,
    amount: amount.toFixed(precision),
  };
}

function CartEmpty({
  hidden = false,
  layout,
  locale,
}: {
  hidden: boolean;
  layout: CartMainProps['layout'];
  locale: StorefrontLocale;
}) {
  const {close} = useAside();
  return (
    <div
      className={
        layout === 'aside' ? 'cart-empty cart-empty--aside' : 'cart-empty'
      }
      hidden={hidden}
    >
      {layout === 'page' && <br />}
      <p>
        {locale === 'fr'
          ? 'Votre panier est encore vide.'
          : 'Your cart is still empty.'}
      </p>
      {layout === 'page' && <br />}
      <Link
        className={layout === 'aside' ? 'button button--orange' : undefined}
        to={`/${locale}/adoptez`}
        onClick={close}
        prefetch="viewport"
      >
        {layout === 'aside'
          ? locale === 'fr'
            ? 'Découvrir les produits'
            : 'Explore products'
          : locale === 'fr'
            ? 'Découvrir Rudimenterre →'
            : 'Discover Rudimenterre →'}
      </Link>
    </div>
  );
}
