import {useState} from 'react';
import {Link, useFetcher, useLocation, useSearchParams, type MetaFunction} from 'react-router';
import {localeFromPathname} from '~/lib/i18n';
import styles from './Page.css?url';
import type {action} from './action.server';

export const links = () => [{rel: 'stylesheet', href: styles}];

export const meta: MetaFunction = ({params}) => [
  {title: `${params.locale === 'en' ? 'Stay in touch' : 'Restons en contact'} | Rudimenterre`},
  {name: 'description', content: params.locale === 'en'
    ? 'Recipes, workshops and Cuicui news, tailored to your interests.'
    : 'Des recettes, des ateliers et des nouvelles du Cuicui, selon vos goûts.'},
];

export default function NewsletterPage() {
  const locale = localeFromPathname(useLocation().pathname);
  const fr = locale === 'fr';
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<typeof action>();
  const preview = import.meta.env.DEV ? searchParams.get('preview') : null;
  const sending = fetcher.state !== 'idle' || preview === 'sending';
  const success = (!sending && fetcher.data?.success) || preview === 'success';
  const [invalid, setInvalid] = useState(false);

  return (
    <article className="newsletter-page" aria-labelledby="newsletter-title">
      <div className="newsletter-photo">
        <img
          src="/images/rudimenterre/home-newsletter-banner.webp"
          alt={fr ? 'Une table de Cuicui en terre cuite, de pain et de plantes aromatiques' : 'A table of terracotta Cuicui vessels, bread and aromatic plants'}
          width="5368"
          height="3579"
          fetchPriority="high"
        />
      </div>

      <section className="newsletter-panel">
        <div className="newsletter-content">
          <p className="newsletter-eyebrow">{fr ? 'La newsletter Rudimenterre' : 'The Rudimenterre newsletter'}</p>
          <h1 id="newsletter-title">{fr ? 'Restons en contact' : 'Let’s stay in touch'}</h1>
          <p className="newsletter-intro">{fr
            ? 'Des recettes, des ateliers et des nouvelles du Cuicui, selon vos goûts.'
            : 'Recipes, workshops and Cuicui news, tailored to your interests.'}</p>

          {preview && <p className="newsletter-preview">{fr ? 'Aperçu de développement — aucune inscription réelle.' : 'Development preview — no real subscription.'}</p>}

          <fetcher.Form className="newsletter-form" method="post" onSubmit={(event) => {
            if (preview) event.preventDefault();
          }}>
            <div hidden aria-hidden="true">
              <label htmlFor="newsletter-website">Website</label>
              <input id="newsletter-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="newsletter-email">
              <label htmlFor="newsletter-email">{fr ? 'Votre adresse courriel' : 'Your email address'}</label>
              <input
                id="newsletter-email"
                name="email"
                maxLength={254}
                type="email"
                autoComplete="email"
                placeholder={fr ? 'vous@exemple.com' : 'you@example.com'}
                required
                disabled={sending || success}
                aria-invalid={invalid || preview === 'invalid' || undefined}
                aria-describedby={invalid || preview === 'invalid' ? 'newsletter-email-error' : undefined}
                onInvalid={() => setInvalid(true)}
                onChange={() => setInvalid(false)}
              />
              {(invalid || preview === 'invalid') && <p className="newsletter-error" id="newsletter-email-error" role="alert">{fr ? 'Saisissez une adresse courriel valide.' : 'Enter a valid email address.'}</p>}
            </div>

            <fieldset disabled={sending || success}>
              <legend>{fr ? 'Qu’aimeriez-vous recevoir ?' : 'What would you like to receive?'}</legend>
              {[
                ['recipes', fr ? 'Recettes et astuces' : 'Recipes and tips'],
                ['workshops', fr ? 'Ateliers et rencontres' : 'Workshops and gatherings'],
                ['news', fr ? 'Nouvelles du Cuicui' : 'Cuicui news'],
              ].map(([id, label]) => (
                <label className="newsletter-interest" key={id}>
                  <input type="checkbox" name="interests" value={id} />
                  <span>{label}</span>
                </label>
              ))}
              <p className="newsletter-hint">{fr ? 'Sans préférence, recevez les nouvelles générales.' : 'No preference? Receive our general news.'}</p>
            </fieldset>

            <button className="button newsletter-submit" type="submit" disabled={sending || success} aria-busy={sending}>
              {sending ? (fr ? 'Inscription en cours…' : 'Signing up…') : (fr ? 'Je m’inscris' : 'Sign me up')}
            </button>
            {!sending && (fetcher.data?.error || preview === 'error') && <p className="newsletter-error" role="alert">{fetcher.data?.error || (fr ? 'L’inscription n’a pas pu aboutir. Veuillez réessayer.' : 'Sign-up failed. Please try again.')}</p>}
            {success && <p className="newsletter-success" role="status">{fr ? 'Merci ! Vous êtes sur la liste. À bientôt dans votre boîte courriel.' : 'Thank you! You’re on the list. See you in your inbox.'}</p>}

            <p className="newsletter-consent">{fr ? 'En vous inscrivant, vous acceptez de recevoir les nouvelles de Rudimenterre. Désinscription possible à tout moment. Consultez notre ' : 'By signing up, you agree to receive news from Rudimenterre. Unsubscribe at any time. Read our '}
              <Link to={`/${locale}/policies/privacy-policy`}>{fr ? 'politique de confidentialité' : 'privacy policy'}</Link>.
            </p>
          </fetcher.Form>
        </div>
      </section>
    </article>
  );
}
