import {useEffect, useRef} from 'react';
import {useFetcher, useLocation, type MetaFunction} from 'react-router';
import {localeFromPathname} from '~/lib/i18n';
import styles from './Page.css?url';

export const links = () => [{rel: 'stylesheet', href: styles}];

export const meta: MetaFunction = ({params}) => [
  {title: `${params.locale === 'en' ? 'Contact us' : 'Contactez-nous'} | Rudimenterre`},
  {
    name: 'description',
    content: params.locale === 'en'
      ? 'Questions about Cuicui, your order or our workshops? Get in touch with Rudimenterre by email.'
      : 'Une question sur le Cuicui, votre commande ou nos ateliers ? Contactez Rudimenterre par courriel.',
  },
];

export default function ContactsPage({press = false}: {press?: boolean}) {
  const fr = localeFromPathname(useLocation().pathname) === 'fr';
  const fetcher = useFetcher<{success?: boolean; error?: string}>();
  const form = useRef<HTMLFormElement>(null);
  const sending = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) form.current?.reset();
  }, [fetcher.state, fetcher.data]);

  return (
    <article className="contacts-page" aria-labelledby="contacts-title">
      <div className="contacts-content">
        <p className="eyebrow">Rudimenterre · {press ? (fr ? 'Relations presse' : 'Media enquiries') : (fr ? 'À votre écoute' : 'Here to help')}</p>
        <h1 id="contacts-title">{press ? (fr ? 'Presse et médias' : 'Press and media') : (fr ? 'Contactez-nous' : 'Contact us')}</h1>
        <p className="contacts-intro">
          {press ? (fr
            ? 'Vous préparez un article, une entrevue ou un reportage ? Pour en savoir plus sur Rudimenterre et le Cuicui, demander des visuels ou organiser une rencontre, écrivez-nous.'
            : 'Working on an article, interview or feature? Get in touch to learn more about Rudimenterre and Cuicui, request images or arrange a conversation.') : fr
            ? 'Une question sur le Cuicui, votre commande ou nos ateliers ? Écrivez-nous, nous serons heureux d’échanger avec vous.'
            : 'Have a question about Cuicui, your order or our workshops? Write to us — we’d love to hear from you.'}
        </p>
        <fetcher.Form className="contacts-form" method="post" ref={form}>
          <div className="contacts-field">
            <label htmlFor="contact-name">{fr ? 'Votre nom (facultatif)' : 'Your name (optional)'}</label>
            <input id="contact-name" name="name" autoComplete="name" maxLength={100} disabled={sending} />
          </div>
          <div className="contacts-field">
            <label htmlFor="contact-email">{fr ? 'Votre adresse courriel' : 'Your email address'}</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={sending} />
          </div>
          <div className="contacts-field contacts-field--message">
            <label htmlFor="contact-message">{press ? (fr ? 'Votre demande' : 'Your enquiry') : (fr ? 'Votre message' : 'Your message')}</label>
            {press && <p id="press-message-hint" className="contacts-form-hint">{fr
              ? 'Précisez votre média, le sujet de votre demande et, si nécessaire, votre date de publication.'
              : 'Please include your publication, the topic of your enquiry and any publication deadline.'}</p>}
            <textarea id="contact-message" name="message" rows={7} required maxLength={5000} disabled={sending} aria-describedby={press ? 'press-message-hint' : undefined} />
          </div>
          <div hidden aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <p className="contacts-form-hint">{fr ? 'Votre courriel et votre message sont obligatoires.' : 'Your email address and message are required.'}</p>
          <button className="button button--dark contacts-write" type="submit" disabled={sending} aria-busy={sending}>
            {sending
              ? (fr ? 'Envoi en cours…' : 'Sending…')
              : (fr ? 'Envoyer le message' : 'Send message')}
          </button>
          <div className="contacts-feedback" aria-live="polite" aria-atomic="true">
            {!sending && fetcher.data?.success && <p className="contacts-success" role="status">{fr ? 'Merci ! Votre message a bien été envoyé.' : 'Thank you! Your message has been sent.'}</p>}
            {!sending && fetcher.data?.error && <p className="contacts-error" role="alert">{fetcher.data.error}</p>}
          </div>
        </fetcher.Form>
        <div className="contacts-details">
          <h2>{fr ? 'Vous préférez nous écrire directement ?' : 'Prefer to email us directly?'}</h2>
          <a className="contacts-email" href="mailto:info@rudimenterre.com">
            info@rudimenterre.com
          </a>
        </div>
      </div>
    </article>
  );
}
