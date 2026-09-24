import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from '../../routes/+types/($locale).account.addresses';
import {useId} from 'react';
import type {AccountContext, AccountLocale} from '~/pages/account/context';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = ({params}) => {
  return [{title: params.locale === 'fr' ? 'Mes adresses' : 'My addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;
  const fr = new URL(request.url).pathname.split('/')[1] !== 'en';

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error(
        fr
          ? 'Une adresse doit être sélectionnée.'
          : 'You must provide an address id.',
      );
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {
          error: {
            [addressId]: fr
              ? 'Votre session a expiré. Reconnectez-vous.'
              : 'Your session has expired. Sign in again.',
          },
        },
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error(
              fr
                ? 'La création de l’adresse a échoué.'
                : 'Address creation failed.',
            );
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error(
              fr
                ? 'La mise à jour de l’adresse a échoué.'
                : 'Address update failed.',
            );
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error(
              fr
                ? 'La suppression de l’adresse a échoué.'
                : 'Address deletion failed.',
            );
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {
            error: {
              [addressId]: fr
                ? 'Méthode non autorisée.'
                : 'Method not allowed.',
            },
          },
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer, locale} = useOutletContext<AccountContext>();
  const {defaultAddress, addresses} = customer;
  const fr = locale === 'fr';

  return (
    <div className="account-addresses">
      <header className="account-section-heading">
        <p className="eyebrow">
          {fr ? 'Livraison en toute simplicité' : 'A smoother delivery'}
        </p>
        <h2>{fr ? 'Mes adresses' : 'My addresses'}</h2>
        <p>
          {fr
            ? 'Enregistrez vos adresses pour simplifier vos prochaines commandes.'
            : 'Save your addresses to make your next order easier.'}
        </p>
      </header>
      <div className="account-addresses__grid">
        <section className="account-addresses__new">
          <h3>{fr ? 'Ajouter une adresse' : 'Add an address'}</h3>
          <NewAddressForm locale={locale} />
        </section>
        <section className="account-addresses__saved">
          <h3>{fr ? 'Adresses enregistrées' : 'Saved addresses'}</h3>
          {!addresses.nodes.length ? (
            <div className="account-empty-state account-empty-state--compact">
              <p>
                {fr
                  ? 'Vous n’avez pas encore enregistré d’adresse.'
                  : 'You haven’t saved an address yet.'}
              </p>
            </div>
          ) : (
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
              locale={locale}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function NewAddressForm({locale}: {locale: AccountLocale}) {
  const fr = locale === 'fr';
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
      locale={locale}
    >
      {({stateForMethod}) => (
        <div className="account-form-actions">
          <button
            className="account-button account-button--orange"
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle'
              ? fr
                ? 'Création…'
                : 'Creating…'
              : fr
                ? 'Créer l’adresse'
                : 'Create address'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
  locale,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'> & {
  locale: AccountLocale;
}) {
  const fr = locale === 'fr';
  return (
    <div>
      {addresses.nodes.map((address) => (
        <AddressForm
          key={address.id}
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
          locale={locale}
        >
          {({stateForMethod}) => (
            <div className="account-form-actions">
              <button
                className="account-button account-button--orange"
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
              >
                {stateForMethod('PUT') !== 'idle'
                  ? fr
                    ? 'Enregistrement…'
                    : 'Saving…'
                  : fr
                    ? 'Enregistrer'
                    : 'Save address'}
              </button>
              <button
                className="account-button account-button--outline account-button--danger"
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
              >
                {stateForMethod('DELETE') !== 'idle'
                  ? fr
                    ? 'Suppression…'
                    : 'Deleting…'
                  : fr
                    ? 'Supprimer'
                    : 'Delete'}
              </button>
            </div>
          )}
        </AddressForm>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  locale,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  locale: AccountLocale;
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  const generatedId = useId();
  const fr = locale === 'fr';
  const field = (
    name: string,
    label: string,
    placeholder: string,
    autoComplete: string,
    value?: string | null,
    required = false,
    maxLength?: number,
    type = 'text',
    pattern?: string,
  ) => {
    const id = `${generatedId}-${name}`;
    return (
      <div className="account-field" key={name}>
        <label htmlFor={id}>
          {label}
          {required ? ' *' : ''}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={value ?? ''}
          required={required}
          maxLength={maxLength}
          pattern={pattern}
          aria-label={label}
        />
      </div>
    );
  };

  return (
    <Form id={addressId}>
      <fieldset className="account-form-card account-address-card">
        <legend className="sr-only">
          {addressId === 'NEW_ADDRESS_ID'
            ? fr
              ? 'Nouvelle adresse'
              : 'New address'
            : fr
              ? 'Adresse enregistrée'
              : 'Saved address'}
        </legend>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="account-form-grid account-address-grid">
          {field(
            'firstName',
            fr ? 'Prénom' : 'First name',
            fr ? 'Votre prénom' : 'Your first name',
            'given-name',
            address?.firstName,
            true,
          )}
          {field(
            'lastName',
            fr ? 'Nom' : 'Last name',
            fr ? 'Votre nom' : 'Your last name',
            'family-name',
            address?.lastName,
            true,
          )}
          {field(
            'company',
            fr ? 'Entreprise' : 'Company',
            fr ? 'Entreprise (facultatif)' : 'Company (optional)',
            'organization',
            address?.company,
          )}
          {field(
            'address1',
            fr ? 'Adresse' : 'Address',
            fr ? 'Numéro et nom de rue' : 'Street address',
            'address-line1',
            address?.address1,
            true,
          )}
          {field(
            'address2',
            fr ? 'Complément d’adresse' : 'Apartment, suite, etc.',
            fr ? 'Appartement, bureau…' : 'Apartment, suite, etc.',
            'address-line2',
            address?.address2,
          )}
          {field(
            'city',
            fr ? 'Ville' : 'City',
            fr ? 'Ville' : 'City',
            'address-level2',
            address?.city,
            true,
          )}
          {field(
            'zoneCode',
            fr ? 'Province ou région' : 'State / Province',
            fr ? 'Province ou région' : 'State / Province',
            'address-level1',
            address?.zoneCode,
            true,
          )}
          {field(
            'zip',
            fr ? 'Code postal' : 'Postal code',
            fr ? 'Code postal' : 'Postal code',
            'postal-code',
            address?.zip,
            true,
          )}
          {field(
            'territoryCode',
            fr ? 'Pays (code)' : 'Country code',
            fr ? 'Ex. CA ou FR' : 'e.g. CA or US',
            'country',
            address?.territoryCode,
            true,
            2,
          )}
          {field(
            'phoneNumber',
            fr ? 'Téléphone' : 'Phone',
            '+1 613 555-0111',
            'tel',
            address?.phoneNumber,
            false,
            undefined,
            'tel',
            '^\\+?[1-9]\\d{3,14}$',
          )}
        </div>
        <label
          className="account-checkbox"
          htmlFor={`${generatedId}-defaultAddress`}
        >
          <input
            defaultChecked={isDefaultAddress}
            id={`${generatedId}-defaultAddress`}
            name="defaultAddress"
            type="checkbox"
          />
          <span>
            {fr ? 'Définir comme adresse par défaut' : 'Set as default address'}
          </span>
        </label>
        {error ? (
          <p className="account-form-error" role="alert">
            <small>{error}</small>
          </p>
        ) : null}
        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}
