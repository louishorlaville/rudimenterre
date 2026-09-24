import type {
  CartApiQueryFragment,
  MoneyFragment,
} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {StorefrontLocale} from '~/lib/i18n';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
  locale: StorefrontLocale;
  displayedSubtotal?: MoneyFragment;
};

export function CartSummary({
  cart,
  layout,
  locale,
  displayedSubtotal,
}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();
  const currentSubtotal = cart?.cost?.subtotalAmount;
  const subtotal =
    displayedSubtotal ??
    (currentSubtotal?.amount && currentSubtotal.currencyCode
      ? {
          amount: currentSubtotal.amount,
          currencyCode: currentSubtotal.currencyCode,
        }
      : undefined);

  return (
    <div aria-labelledby={summaryId} className={className}>
      <h4 id={summaryId}>
        {locale === 'fr' ? 'Récapitulatif' : 'Order summary'}
      </h4>
      <dl role="group" className="cart-subtotal">
        <dt>{locale === 'fr' ? 'Sous-total' : 'Subtotal'}</dt>
        <dd>{subtotal ? <Money data={subtotal} /> : '-'}</dd>
      </dl>
      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
        locale={locale}
        collapsible={layout === 'aside'}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
        locale={locale}
        collapsible={layout === 'aside'}
      />
      <CartCheckoutActions
        checkoutUrl={cart?.checkoutUrl}
        locale={locale}
        layout={layout}
      />
    </div>
  );
}

function CartCheckoutActions({
  checkoutUrl,
  locale,
  layout,
}: {
  checkoutUrl?: string;
  locale: StorefrontLocale;
  layout: CartLayout;
}) {
  if (!checkoutUrl) return null;

  return (
    <div className="cart-checkout-actions">
      <a
        className={
          layout === 'aside'
            ? 'button button--orange cart-checkout-button'
            : undefined
        }
        href={checkoutUrl}
        target="_self"
      >
        {layout === 'aside' ? (
          locale === 'fr' ? (
            'Passer au paiement'
          ) : (
            'Proceed to checkout'
          )
        ) : (
          <p>
            {locale === 'fr'
              ? 'Passer au paiement →'
              : 'Continue to checkout →'}
          </p>
        )}
      </a>
      {layout === 'page' && <br />}
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
  locale,
  collapsible,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
  locale: StorefrontLocale;
  collapsible: boolean;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section
      aria-label={locale === 'fr' ? 'Réductions' : 'Discounts'}
      className="cart-code-section"
    >
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId}>
            {locale === 'fr' ? 'Code appliqué' : 'Applied discount'}
          </dt>
          <UpdateDiscountForm>
            <div
              className="cart-discount"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes.join(', ')}</code>
              <button
                type="submit"
                aria-label={
                  locale === 'fr'
                    ? 'Retirer le code promotionnel'
                    : 'Remove discount code'
                }
              >
                {locale === 'fr' ? 'Retirer' : 'Remove'}
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      {collapsible ? (
        <details className="cart-code-panel">
          <summary>
            {locale === 'fr'
              ? 'Ajouter un code promotionnel'
              : 'Add a discount code'}
          </summary>
          <DiscountCodeForm
            codes={codes}
            inputId={discountCodeInputId}
            locale={locale}
          />
        </details>
      ) : (
        <DiscountCodeForm
          codes={codes}
          inputId={discountCodeInputId}
          locale={locale}
        />
      )}
    </section>
  );
}

function DiscountCodeForm({
  codes,
  inputId,
  locale,
}: {
  codes: string[];
  inputId: string;
  locale: StorefrontLocale;
}) {
  return (
    <UpdateDiscountForm discountCodes={codes}>
      <div className="cart-code-form">
        <label htmlFor={inputId} className="sr-only">
          {locale === 'fr' ? 'Code promotionnel' : 'Discount code'}
        </label>
        <input
          id={inputId}
          type="text"
          name="discountCode"
          placeholder={locale === 'fr' ? 'Votre code' : 'Your code'}
        />
        <button
          type="submit"
          aria-label={
            locale === 'fr'
              ? 'Appliquer le code promotionnel'
              : 'Apply discount code'
          }
        >
          {locale === 'fr' ? 'Appliquer' : 'Apply'}
        </button>
      </div>
    </UpdateDiscountForm>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
  locale,
  collapsible,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
  locale: StorefrontLocale;
  collapsible: boolean;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section
      aria-label={locale === 'fr' ? 'Cartes-cadeaux' : 'Gift cards'}
      className="cart-code-section"
    >
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>
            {locale === 'fr' ? 'Carte-cadeau appliquée' : 'Applied gift card'}
          </dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-discount">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                locale={locale}
                buttonRef={(el: HTMLButtonElement | null) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                <Money data={giftCard.amountUsed} />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      {collapsible ? (
        <details className="cart-code-panel">
          <summary>
            {locale === 'fr' ? 'Utiliser une carte-cadeau' : 'Use a gift card'}
          </summary>
          <GiftCardCodeForm
            inputId={giftCardInputId}
            locale={locale}
            inputRef={giftCardCodeInput}
            disabled={giftCardAddFetcher.state !== 'idle'}
          />
        </details>
      ) : (
        <GiftCardCodeForm
          inputId={giftCardInputId}
          locale={locale}
          inputRef={giftCardCodeInput}
          disabled={giftCardAddFetcher.state !== 'idle'}
        />
      )}
    </section>
  );
}

function GiftCardCodeForm({
  inputId,
  locale,
  inputRef,
  disabled,
}: {
  inputId: string;
  locale: StorefrontLocale;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
}) {
  return (
    <AddGiftCardForm fetcherKey="gift-card-add">
      <div className="cart-code-form">
        <label htmlFor={inputId} className="sr-only">
          {locale === 'fr' ? 'Code de carte-cadeau' : 'Gift card code'}
        </label>
        <input
          id={inputId}
          type="text"
          name="giftCardCode"
          placeholder={locale === 'fr' ? 'Votre code' : 'Your code'}
          ref={inputRef}
        />
        <button
          type="submit"
          disabled={disabled}
          aria-label={
            locale === 'fr' ? 'Appliquer la carte-cadeau' : 'Apply gift card'
          }
        >
          {locale === 'fr' ? 'Appliquer' : 'Apply'}
        </button>
      </div>
    </AddGiftCardForm>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
  locale,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  locale: StorefrontLocale;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      <button
        type="submit"
        aria-label={
          locale === 'fr'
            ? `Retirer la carte-cadeau se terminant par ${lastCharacters}`
            : `Remove gift card ending in ${lastCharacters}`
        }
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        {locale === 'fr' ? 'Retirer' : 'Remove'}
      </button>
    </CartForm>
  );
}
