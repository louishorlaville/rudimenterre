import type {CustomerFragment} from 'customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  useLoaderData,
  useFetcher,
} from 'react-router';
import {useEffect, useState} from 'react';
import type {NewsletterPreferences as Preferences} from '~/lib/customer-newsletter.server.js';
import type {newsletterAction, profileLoader} from './newsletter.server';
import type {Route} from '../../routes/+types/($locale).account.profile';
import type {AccountContext} from '~/pages/account/context';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: Route.MetaFunction = ({params}) => {
  return [{title: params.locale === 'fr' ? 'Mon profil' : 'My profile'}];
};

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
      {error: fr ? 'Votre profil n’a pas pu être enregistré. Veuillez réessayer.' : 'Your profile could not be saved. Please try again.', customer: null},
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
  const {newsletter} = useLoaderData<typeof profileLoader>();
  const savedFirstName = customer.firstName ?? '';
  const savedLastName = customer.lastName ?? '';
  const [firstName, setFirstName] = useState(savedFirstName);
  const [lastName, setLastName] = useState(savedLastName);
  useEffect(() => {
    setFirstName(savedFirstName);
    setLastName(savedLastName);
  }, [savedFirstName, savedLastName]);
  const profileChanged = firstName !== savedFirstName || lastName !== savedLastName;

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
        <fieldset className="account-form-card" disabled={state !== 'idle'}>
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
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
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
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
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
          disabled={state !== 'idle' || !profileChanged}
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
      <section className="account-newsletter" aria-labelledby="account-newsletter-heading">
        <header className="account-section-heading">
          <h2 id="account-newsletter-heading">{fr ? 'Ma newsletter' : 'My newsletter'}</h2>
          <p>{fr ? 'Choisissez les nouvelles que vous souhaitez recevoir par courriel.' : 'Choose the news you would like to receive by email.'}</p>
        </header>
        {newsletter ? <NewsletterPreferences preferences={newsletter} locale={account.locale} /> : (
          <p className="account-form-error" role="alert">{fr
            ? 'Vos préférences sont indisponibles pour le moment. Rechargez la page pour réessayer.'
            : 'Your preferences are currently unavailable. Reload the page to try again.'}</p>
        )}
      </section>
    </div>
  );
}

function NewsletterPreferences({preferences, locale}: {
  preferences: Preferences;
  locale: 'fr' | 'en';
}) {
  const fr = locale === 'fr';
  const fetcher = useFetcher<typeof newsletterAction>();
  const saving = fetcher.state !== 'idle';
  const [edited, setEdited] = useState(false);
  const [subscribed, setSubscribed] = useState(preferences.subscribed);
  const savedInterests = preferences.interests.join(',');
  const [selectedInterests, setSelectedInterests] = useState(preferences.subscribed ? preferences.interests : []);
  const [language, setLanguage] = useState(preferences.language);
  useEffect(() => {
    setSubscribed(preferences.subscribed);
    setSelectedInterests(preferences.subscribed && savedInterests ? savedInterests.split(',') : []);
  }, [preferences.subscribed, savedInterests]);
  useEffect(() => setLanguage(preferences.language), [preferences.language]);
  const activeInterests = subscribed ? selectedInterests : [];
  const preferencesChanged = subscribed !== preferences.subscribed || language !== preferences.language ||
    activeInterests.length !== preferences.interests.length ||
    activeInterests.some((interest) => !preferences.interests.includes(interest));
  return (
    <fetcher.Form method="post" action={`/${locale}/account/profile/newsletter`} onChange={() => setEdited(true)} onSubmit={() => setEdited(false)}>
      <fieldset key={JSON.stringify(preferences)} className="account-form-card" disabled={saving}>
        <legend>{fr ? 'Abonnement et centres d’intérêt' : 'Subscription and interests'}</legend>
        <label className="account-checkbox">
          <input type="checkbox" name="subscribed" value="yes" checked={subscribed} onChange={(event) => {
            setSubscribed(event.target.checked);
          }} />
          <span>{fr ? 'Je souhaite recevoir la newsletter par courriel' : 'I would like to receive the email newsletter'}</span>
        </label>
        <p className="account-newsletter-hint">{fr
          ? 'Décochez cette case pour vous désinscrire de tous les courriels marketing. Vos confirmations de commande restent actives.'
          : 'Uncheck to unsubscribe from all marketing emails. You will still receive order confirmations.'}</p>
        <fieldset className="account-newsletter-topics" disabled={!subscribed}>
          <legend>{fr ? 'Les sujets qui m’intéressent' : 'Topics I’m interested in'}</legend>
          {[
            ['recipes', fr ? 'Recettes et astuces' : 'Recipes and tips'],
            ['workshops', fr ? 'Ateliers et rencontres' : 'Workshops and gatherings'],
            ['news', fr ? 'Nouvelles du Cuicui' : 'Cuicui news'],
          ].map(([value, label]) => <label className="account-checkbox" key={value}>
            <input type="checkbox" name="interests" value={value} checked={subscribed && selectedInterests.includes(value)} onChange={(event) => {
              setSelectedInterests((selected) => event.target.checked ? [...selected, value] : selected.filter((interest) => interest !== value));
            }} />
            <span>{label}</span>
          </label>)}
          <p className="account-newsletter-hint">{fr ? 'Sans sélection, vous recevrez les nouvelles générales si vous êtes abonné·e.' : 'Without a selection, you will receive general news if subscribed.'}</p>
        </fieldset>
        <div className="account-field">
          <label htmlFor="newsletter-language">{fr ? 'Langue des courriels' : 'Email language'}</label>
          <select id="newsletter-language" name="language" value={language} onChange={(event) => setLanguage(event.target.value as 'fr' | 'en')}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        {!saving && !edited && fetcher.data?.success && <p className="account-form-success" role="status">{fr ? 'Vos préférences ont été enregistrées.' : 'Your preferences have been saved.'}</p>}
        {!saving && !edited && fetcher.data?.error && <p className="account-form-error" role="alert">{fetcher.data.error}</p>}
      </div>
      <button className="account-button account-button--orange" type="submit" disabled={saving || !preferencesChanged} aria-busy={saving}>
        {saving ? (fr ? 'Enregistrement…' : 'Saving…') : (fr ? 'Enregistrer mes préférences' : 'Save my preferences')}
      </button>
    </fetcher.Form>
  );
}
