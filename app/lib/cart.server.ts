import {
  createCartServerHandlers,
  createCartCookie,
  gql,
  getCartId,
  type StorefrontClient,
  type CartData,
  type ShopifyRequestContext,
} from '@shopify/hydrogen';
import type {WritableCustomerSessionManager} from '@shopify/hydrogen/customer-account';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export const CART_FRAGMENT = gql(`#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    parentRelationship {
      parent {
        id
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    lineComponents {
      ...CartLine
    }
  }
  fragment CartFragment on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 250) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
`);
export const cartHandlers = createCartServerHandlers({fragment: CART_FRAGMENT});
export type CartResult = {
  cart: CartApiQueryFragment | null;
  errors?: Array<{message: string}>;
  warnings?: Array<{message: string}>;
};

// /api/cart belongs to Hydrogen; gift cards and legacy permalinks remain app features.
export function createCartService(
  client: StorefrontClient,
  request: Request,
  handlers: {
    get(context: {
      storefrontClient: StorefrontClient;
      request: Request;
      sessionManager: WritableCustomerSessionManager;
      requestContext: ShopifyRequestContext;
    }): Promise<{data: {cart: unknown}}>;
  },
  sessionManager: WritableCustomerSessionManager,
) {
  let cartId = getCartId(request);
  const setCartId = (id: string) => {
    cartId = id;
    return new Headers({
      'Set-Cookie': `${createCartCookie(id)}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`,
    });
  };
  async function mutate(
    field: string,
    definition: string,
    args: string,
    variables: Record<string, unknown>,
  ): Promise<CartResult> {
    const graphql = client.graphql as (
      document: string,
      options: {variables: Record<string, unknown>},
    ) => Promise<{data: unknown; errors?: Array<{message: string}>}>;
    const document: string = `mutation AppCart(${definition}, $country:CountryCode, $language:LanguageCode) @inContext(country:$country,language:$language) { ${field}(${args}) { cart { ...CartFragment } userErrors { message } warnings { message } } } ${CART_FRAGMENT}`;
    const result = await graphql(document, {variables});
    const payload = (
      result.data as Record<
        string,
        {
          cart: CartApiQueryFragment | null;
          userErrors?: Array<{message: string}>;
          warnings?: Array<{message: string}>;
        }
      > | null
    )?.[field];
    return {
      cart: payload?.cart ?? null,
      errors: result.errors ?? payload?.userErrors,
      warnings: payload?.warnings,
    };
  }
  const create = (input: Record<string, unknown>) =>
    mutate('cartCreate', '$input:CartInput!', 'input:$input', {input});
  const change = (field: string, key: string, type: string, input: unknown) =>
    mutate(
      field,
      `$cartId:ID!,$${key}:${type}`,
      `cartId:$cartId,${key}:$${key}`,
      {cartId, [key]: input},
    );
  return {
    setCartId,
    create,
    get: async () =>
      (
        await handlers.get({
          storefrontClient: client,
          request,
          sessionManager,
          requestContext: client.requestContext,
        })
      ).data.cart as (CartApiQueryFragment & CartData) | null,
    addLines: (lines: unknown[]) =>
      cartId
        ? change('cartLinesAdd', 'lines', '[CartLineInput!]!', lines)
        : create({lines}),
    updateLines: (lines: unknown[]) =>
      change('cartLinesUpdate', 'lines', '[CartLineUpdateInput!]!', lines),
    removeLines: (lineIds: string[]) =>
      change('cartLinesRemove', 'lineIds', '[ID!]!', lineIds),
    updateDiscountCodes: (discountCodes: string[]) =>
      cartId
        ? change(
            'cartDiscountCodesUpdate',
            'discountCodes',
            '[String!]!',
            discountCodes,
          )
        : create({discountCodes}),
    addGiftCardCodes: (giftCardCodes: string[]) =>
      change(
        'cartGiftCardCodesAdd',
        'giftCardCodes',
        '[String!]!',
        giftCardCodes,
      ),
    removeGiftCardCodes: (appliedGiftCardIds: string[]) =>
      change(
        'cartGiftCardCodesRemove',
        'appliedGiftCardIds',
        '[ID!]!',
        appliedGiftCardIds,
      ),
    updateBuyerIdentity: (buyerIdentity: Record<string, unknown>) =>
      change(
        'cartBuyerIdentityUpdate',
        'buyerIdentity',
        'CartBuyerIdentityInput!',
        buyerIdentity,
      ),
  };
}
