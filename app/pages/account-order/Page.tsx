import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from '../../routes/+types/($locale).account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {
  accountLocale,
  accountPath,
  accountStatus,
} from '~/pages/account/context';

export const meta: Route.MetaFunction = ({data, params}) => {
  return [
    {
      title: `${params.locale === 'fr' ? 'Commande' : 'Order'} ${data?.order?.name}`,
    },
  ];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const locale = accountLocale(params.locale);
  if (!params.id) {
    return redirect(accountPath(locale, '/account/orders'));
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus =
    order.fulfillments.nodes[0]?.status ?? 'UNFULFILLED';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
    locale,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
    locale,
  } = useLoaderData<typeof loader>();
  const fr = locale === 'fr';
  const date = new Intl.DateTimeFormat(fr ? 'fr-CA' : 'en-CA', {
    dateStyle: 'long',
  }).format(new Date(order.processedAt!));
  return (
    <div className="account-order">
      <Link
        className="account-back-link"
        to={accountPath(locale, '/account/orders')}
      >
        ← {fr ? 'Retour aux commandes' : 'Back to orders'}
      </Link>
      <header className="account-section-heading">
        <p className="eyebrow">
          {fr ? 'Commande' : 'Order'} {order.name}
        </p>
        <h2>{fr ? 'Merci pour votre commande' : 'Thank you for your order'}</h2>
      </header>
      <div className="account-order-meta">
        <span>
          {fr ? 'Passée le' : 'Placed on'} {date}
        </span>
        {order.confirmationNumber && (
          <span>
            {fr ? 'Confirmation' : 'Confirmation'} · {order.confirmationNumber}
          </span>
        )}
        <span className="account-status-pill">
          {accountStatus(fulfillmentStatus, locale)}
        </span>
      </div>
      <div className="account-order-detail-grid">
        <div className="account-order-table">
          <table>
            <thead>
              <tr>
                <th scope="col">{fr ? 'Produit' : 'Product'}</th>
                <th scope="col">{fr ? 'Prix' : 'Price'}</th>
                <th scope="col">{fr ? 'Quantité' : 'Quantity'}</th>
                <th scope="col">{fr ? 'Total' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((lineItem) => (
                <OrderLineRow key={lineItem.id} lineItem={lineItem} />
              ))}
            </tbody>
            <tfoot>
              {((discountValue && discountValue.amount) ||
                discountPercentage) && (
                <tr>
                  <th scope="row" colSpan={3}>
                    <p>{fr ? 'Réduction' : 'Discount'}</p>
                  </th>
                  <td>
                    {discountPercentage ? (
                      <span>-{discountPercentage}%</span>
                    ) : (
                      discountValue && <Money data={discountValue!} />
                    )}
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row" colSpan={3}>
                  <p>{fr ? 'Sous-total' : 'Subtotal'}</p>
                </th>
                <td>
                  <Money data={order.subtotal!} />
                </td>
              </tr>
              <tr>
                <th scope="row" colSpan={3}>
                  <p>{fr ? 'Taxes' : 'Tax'}</p>
                </th>
                <td>
                  <Money data={order.totalTax!} />
                </td>
              </tr>
              <tr>
                <th scope="row" colSpan={3}>
                  <p>{fr ? 'Total' : 'Total'}</p>
                </th>
                <td>
                  <Money data={order.totalPrice!} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <aside className="account-order-address">
          <h3>{fr ? 'Adresse de livraison' : 'Shipping address'}</h3>
          {order?.shippingAddress ? (
            <address>
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : (
                ''
              )}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : (
                ''
              )}
            </address>
          ) : (
            <p>
              {fr ? 'Aucune adresse de livraison.' : 'No shipping address.'}
            </p>
          )}
          <h3>{fr ? 'Suivi' : 'Tracking'}</h3>
          <p>{accountStatus(fulfillmentStatus, locale)}</p>
          <a
            className="account-button account-button--light"
            target="_blank"
            href={order.statusPageUrl}
            rel="noreferrer"
          >
            {fr ? 'Suivre la commande' : 'Track this order'}{' '}
            <span aria-hidden="true">↗</span>
          </a>
        </aside>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  const lineTotal = {
    ...lineItem.price!,
    amount: (
      Number(lineItem.price!.amount) * lineItem.quantity -
      Number(lineItem.totalDiscount?.amount ?? 0)
    ).toFixed(2),
  };

  return (
    <tr key={lineItem.id}>
      <td>
        <div>
          {lineItem.image && (
            <div>
              <Image
                data={lineItem.image}
                alt={lineItem.image.altText ?? lineItem.title}
                width={96}
                height={96}
              />
            </div>
          )}
          <div>
            <p>{lineItem.title}</p>
            <small>{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price!} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineTotal} />
      </td>
    </tr>
  );
}
