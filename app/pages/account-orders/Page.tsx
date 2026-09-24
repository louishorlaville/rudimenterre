import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from '../../routes/+types/($locale).account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {pagePath} from '~/lib/editorial-content';
import {
  accountLocale,
  accountPath,
  accountStatus,
  type AccountLocale,
} from '~/pages/account/context';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
  locale: AccountLocale;
};

export const meta: Route.MetaFunction = ({params}) => {
  return [{title: params.locale === 'fr' ? 'Mes commandes' : 'My orders'}];
};

export async function loader({request, context, params}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {
    customer: data.customer,
    filters,
    locale: accountLocale(params.locale),
  };
}

export default function Orders() {
  const {customer, filters, locale} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const fr = locale === 'fr';

  return (
    <div className="orders">
      <div className="account-section-heading">
        <p className="eyebrow">{fr ? 'Votre historique' : 'Your history'}</p>
        <h2>{fr ? 'Mes commandes' : 'My orders'}</h2>
        <p>
          {fr
            ? 'Un aperçu de vos achats chez Rudimenterre.'
            : 'A look back at your purchases from Rudimenterre.'}
        </p>
      </div>
      <OrderSearchForm currentFilters={filters} locale={locale} />
      <OrdersTable orders={orders} filters={filters} locale={locale} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
  locale,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
  locale: AccountLocale;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="account-orders-list" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection
          connection={orders}
          ariaLabel={locale === 'fr' ? 'Liste des commandes' : 'Order list'}
          resourcesClassName="account-orders-list__items"
          labels={
            locale === 'fr'
              ? {
                  loading: 'Chargement…',
                  previous: 'Voir les précédentes',
                  next: 'Voir les suivantes',
                }
              : {
                  loading: 'Loading…',
                  previous: 'Load previous',
                  next: 'Load more',
                }
          }
        >
          {({node: order}) => (
            <OrderItem key={order.id} order={order} locale={locale} />
          )}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} locale={locale} />
      )}
    </div>
  );
}

function EmptyOrders({
  hasFilters = false,
  locale,
}: {
  hasFilters?: boolean;
  locale: AccountLocale;
}) {
  const fr = locale === 'fr';
  return (
    <div className="account-empty-state">
      {hasFilters ? (
        <>
          <h3>{fr ? 'Aucune commande trouvée' : 'No orders found'}</h3>
          <p>
            {fr
              ? 'Essayez avec un autre numéro de commande ou de confirmation.'
              : 'Try a different order or confirmation number.'}
          </p>
          <Link
            className="account-button account-button--light"
            to={accountPath(locale, '/account/orders')}
          >
            {fr ? 'Effacer les filtres' : 'Clear filters'}{' '}
            <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <>
          <h3>
            {fr
              ? 'Votre première commande vous attend'
              : 'Your first order is waiting'}
          </h3>
          <p>
            {fr
              ? 'Découvrez les pièces Rudimenterre et trouvez votre prochain essentiel en cuisine.'
              : 'Explore Rudimenterre pieces and find your next kitchen essential.'}
          </p>
          <Link
            className="account-button account-button--orange"
            to={pagePath(locale, 'adopt')}
          >
            {fr ? 'Découvrir la collection' : 'Explore the collection'}{' '}
            <span aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
  locale,
}: {
  currentFilters: OrderFilterParams;
  locale: AccountLocale;
}) {
  const fr = locale === 'fr';
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="order-search-form"
      aria-label={fr ? 'Rechercher une commande' : 'Search orders'}
    >
      <fieldset className="order-search-fieldset">
        <legend className="order-search-legend">
          {fr ? 'Retrouver une commande' : 'Find an order'}
        </legend>

        <div className="order-search-inputs">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder={fr ? 'Numéro de commande' : 'Order number'}
            aria-label={fr ? 'Numéro de commande' : 'Order number'}
            defaultValue={currentFilters.name || ''}
            className="order-search-input"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder={fr ? 'Numéro de confirmation' : 'Confirmation number'}
            aria-label={fr ? 'Numéro de confirmation' : 'Confirmation number'}
            defaultValue={currentFilters.confirmationNumber || ''}
            className="order-search-input"
          />
        </div>

        <div className="order-search-buttons">
          <button type="submit" disabled={isSearching}>
            {isSearching
              ? fr
                ? 'Recherche…'
                : 'Searching…'
              : fr
                ? 'Rechercher'
                : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              {fr ? 'Effacer' : 'Clear'}
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
}

function OrderItem({
  order,
  locale,
}: {
  order: OrderItemFragment;
  locale: AccountLocale;
}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const fr = locale === 'fr';
  const orderUrl = accountPath(locale, `/account/orders/${btoa(order.id)}`);
  const date = new Intl.DateTimeFormat(fr ? 'fr-CA' : 'en-CA', {
    dateStyle: 'long',
  }).format(new Date(order.processedAt));
  return (
    <article className="account-order-card">
      <div className="account-order-card__main">
        <p className="eyebrow">
          {fr ? 'Commande' : 'Order'} #{order.number}
        </p>
        <p>
          {fr ? 'Passée le' : 'Placed on'} {date}
        </p>
        {order.confirmationNumber && (
          <p>
            {fr ? 'Confirmation' : 'Confirmation'} · {order.confirmationNumber}
          </p>
        )}
      </div>
      <div className="account-order-card__status">
        {order.financialStatus && (
          <span>{accountStatus(order.financialStatus, locale)}</span>
        )}
        {fulfillmentStatus && (
          <span>{accountStatus(fulfillmentStatus, locale)}</span>
        )}
      </div>
      <Money data={order.totalPrice} />
      <Link className="account-order-card__link" to={orderUrl}>
        {fr ? 'Voir la commande' : 'View order'}{' '}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
