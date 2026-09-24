import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import type {Route} from '../../routes/+types/($locale).account.profile';
import type {AccountContext} from '~/pages/account/context';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = ({params}) => {
  return [{title: params.locale === 'fr' ? 'Mon profil' : 'My profile'}];
};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;
  const fr = new URL(request.url).pathname.split('/')[1] !== 'en';

  if (request.method !== 'PUT') {
    return data(
      {error: fr ? 'Méthode non autorisée.' : 'Method not allowed.'},
      {status: 405},
    );
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error(
        fr ? 'La mise à jour du profil a échoué.' : 'Profile update failed.',
      );
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<AccountContext>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;
  const fr = account.locale === 'fr';

  return (
    <div className="account-profile">
      <header className="account-section-heading">
        <p className="eyebrow">{fr ? 'Vos informations' : 'Your details'}</p>
        <h2>{fr ? 'Mon profil' : 'My profile'}</h2>
        <p>
          {fr
            ? 'Gardez vos coordonnées à jour pour simplifier vos prochaines commandes.'
            : 'Keep your details up to date for a smoother checkout next time.'}
        </p>
      </header>
      <Form method="PUT">
        <fieldset className="account-form-card">
          <legend>
            {fr ? 'Informations personnelles' : 'Personal information'}
          </legend>
          <div className="account-form-grid">
            <div className="account-field">
              <label htmlFor="firstName">{fr ? 'Prénom' : 'First name'}</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder={fr ? 'Votre prénom' : 'Your first name'}
                aria-label={fr ? 'Prénom' : 'First name'}
                defaultValue={customer.firstName ?? ''}
                minLength={2}
              />
            </div>
            <div className="account-field">
              <label htmlFor="lastName">{fr ? 'Nom' : 'Last name'}</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={fr ? 'Votre nom' : 'Your last name'}
                aria-label={fr ? 'Nom' : 'Last name'}
                defaultValue={customer.lastName ?? ''}
                minLength={2}
              />
            </div>
          </div>
        </fieldset>
        {action?.customer && !action.error ? (
          <p className="account-form-success" role="status">
            {fr
              ? 'Votre profil a été mis à jour.'
              : 'Your profile has been updated.'}
          </p>
        ) : null}
        {action?.error ? (
          <p className="account-form-error" role="alert">
            <small>{action.error}</small>
          </p>
        ) : null}
        <button
          className="account-button account-button--orange"
          type="submit"
          disabled={state !== 'idle'}
        >
          {state !== 'idle'
            ? fr
              ? 'Enregistrement…'
              : 'Saving…'
            : fr
              ? 'Enregistrer mes informations'
              : 'Save my details'}
        </button>
      </Form>
    </div>
  );
}
