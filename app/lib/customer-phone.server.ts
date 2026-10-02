import type {CustomerAccount} from '@shopify/hydrogen';

// The customer ID always comes from the authenticated Customer Account API.
// Address recipients can differ from the account owner: only replace an existing
// contact phone when saving the default address. Never change marketing consent.
export async function syncCustomerPhone({
  customerAccount,
  env,
  addressId,
  phoneNumber,
  territoryCode,
}: {
  customerAccount: Pick<CustomerAccount, 'query'>;
  env: Pick<Env, 'PUBLIC_STORE_DOMAIN' | 'SHOPIFY_ADMIN_API_ACCESS_TOKEN'>;
  addressId: string;
  phoneNumber?: string | null;
  territoryCode?: string | null;
}): Promise<boolean> {
  if (!phoneNumber?.trim()) return true;

  try {
    const {data, errors} = await customerAccount.query<{
      customer: {
        id: string;
        phoneNumber?: {phoneNumber: string} | null;
        defaultAddress?: {id: string} | null;
      };
    }>(`#graphql
      query CustomerPhoneForAddress {
        customer {
          id
          phoneNumber { phoneNumber }
          defaultAddress { id }
        }
      }
    `);
    const customer = data?.customer;
    if (errors?.length || !customer?.id) return false;
    if (customer.phoneNumber?.phoneNumber && customer.defaultAddress?.id !== addressId) {
      return true;
    }

    let phone = phoneNumber.replace(/[\s().-]/g, '');
    if (territoryCode === 'CA' || territoryCode === 'US') {
      if (/^\d{10}$/.test(phone)) phone = `+1${phone}`;
      else if (/^1\d{10}$/.test(phone)) phone = `+${phone}`;
    }
    if (phone === customer.phoneNumber?.phoneNumber) return true;
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) return false;

    const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const domain = env.PUBLIC_STORE_DOMAIN;
    if (!token || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) return false;

    const response = await fetch(`https://${domain}/admin/api/2026-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        query: `mutation SyncCustomerPhone($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id phone }
            userErrors { field message }
          }
        }`,
        variables: {input: {id: customer.id, phone}},
      }),
    });
    if (!response.ok) return false;
    const result = await response.json() as {
      errors?: unknown[];
      data?: {
        customerUpdate?: {
          customer?: {id: string; phone: string | null} | null;
          userErrors?: unknown[];
        };
      };
    };
    const updated = result.data?.customerUpdate;
    return !result.errors?.length && !updated?.userErrors?.length &&
      updated?.customer?.id === customer.id && updated.customer.phone === phone;
  } catch {
    // The address is already saved; a contact-phone failure must not lose it or
    // encourage duplicate address creation. The caller displays a partial-save notice.
    return false;
  }
}
