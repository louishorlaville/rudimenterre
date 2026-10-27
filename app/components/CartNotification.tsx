import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {Link, useLocation} from 'react-router';
import {useCart, useStorefrontCart} from '~/lib/cart';
import {localeFromPathname} from '~/lib/i18n';

const CartNotificationContext = createContext<
  ((merchandiseId: string) => void) | null
>(null);

export function useCartNotification() {
  const notify = useContext(CartNotificationContext);
  if (!notify) throw new Error('CartNotificationProvider is required');
  return notify;
}

export function CartNotificationProvider({children}: {children: ReactNode}) {
  const cart = useStorefrontCart();
  const pending = useCart((state) => Boolean(state.pending.cost));
  const locale = localeFromPathname(useLocation().pathname);
  const [waiting, setWaiting] = useState<{
    merchandiseId: string;
    quantity: number;
    started: boolean;
  } | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    quantity: number;
  } | null>(null);
  const [paused, setPaused] = useState(false);

  function watchAddition(merchandiseId: string) {
    setPaused(false);
    setWaiting({
      merchandiseId,
      started: false,
      quantity: (cart?.lines.nodes ?? [])
        .filter((line) => line.merchandise.id === merchandiseId)
        .reduce((sum, line) => sum + line.quantity, 0),
    });
  }

  useEffect(() => {
    if (!waiting) return;
    if (pending) {
      if (!waiting.started) setWaiting({...waiting, started: true});
      return;
    }
    if (!waiting.started) return;
    const lines = (cart?.lines.nodes ?? []).filter(
      (line) => line.merchandise.id === waiting.merchandiseId,
    );
    const addedQuantity =
      lines.reduce((sum, line) => sum + line.quantity, 0) - waiting.quantity;
    setWaiting(null);
    if (addedQuantity > 0) {
      setNotification({
        title: lines[0].merchandise.product.title,
        quantity: addedQuantity,
      });
    }
  }, [cart, pending, waiting]);

  useEffect(() => {
    if (!notification || paused) return;
    const timeout = window.setTimeout(() => setNotification(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [notification, paused]);

  return (
    <CartNotificationContext.Provider value={watchAddition}>
      {children}
      <div className="cart-notification-region">
        <div role="status" aria-live="polite" aria-atomic="true">
          {notification && (
            <div
              className="cart-notification"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setPaused(false);
              }}
            >
              <svg
                className="cart-notification__check"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m7.5 12 3 3 6-6" />
              </svg>
              <div className="cart-notification__copy">
                <p className="cart-notification__title">
                  {locale === 'fr' ? 'Ajouté au panier' : 'Added to cart'}
                </p>
                <p>
                  {notification.title} × {notification.quantity}
                </p>
                <Link
                  to={`/${locale}/cart`}
                  onClick={() => setNotification(null)}
                >
                  {locale === 'fr' ? 'Voir le panier' : 'View cart'}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
              <button
                type="button"
                className="cart-notification__close"
                onClick={() => setNotification(null)}
                aria-label={
                  locale === 'fr'
                    ? 'Fermer la notification'
                    : 'Dismiss notification'
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </CartNotificationContext.Provider>
  );
}
