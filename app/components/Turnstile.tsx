import {useEffect, useRef, useState} from 'react';
import {useNonce} from '~/lib/nonce';

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action: string;
    language: string;
    appearance: 'interaction-only';
    size: 'compact';
    theme: 'light';
    'response-field': false;
    callback: (token: string) => void;
  } & Record<'expired-callback' | 'error-callback' | 'timeout-callback', () => void>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptLoad: Promise<TurnstileApi> | undefined;
function loadTurnstile(nonce?: string) {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptLoad) {
    scriptLoad = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement('script');
      const timer = window.setTimeout(fail, 15_000);
      function fail() {
        window.clearTimeout(timer);
        script.remove();
        scriptLoad = undefined;
        reject(new Error('Bot verification unavailable'));
      }
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      if (nonce) script.nonce = nonce;
      script.onload = () => {
        window.clearTimeout(timer);
        if (window.turnstile) resolve(window.turnstile);
        else fail();
      };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return scriptLoad;
}

export function Turnstile({siteKey, action, fr, onToken}: {
  siteKey: string;
  action: 'contact' | 'press';
  fr: boolean;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const nonce = useNonce();
  const [state, setState] = useState<'loading' | 'verified' | 'error'>('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let widget: string | undefined;
    let api: TurnstileApi | undefined;
    onToken('');
    setState('loading');
    const invalidate = () => {
      if (!active) return;
      onToken('');
      setState('error');
    };
    if (!siteKey) invalidate();
    else void loadTurnstile(nonce).then((loaded) => {
      if (!active || !container.current) return;
      api = loaded;
      widget = api.render(container.current, {
        sitekey: siteKey, action, language: fr ? 'fr' : 'en',
        appearance: 'interaction-only', size: 'compact', theme: 'light',
        'response-field': false,
        callback: (token) => {
          if (!active) return;
          onToken(token);
          setState('verified');
        },
        'expired-callback': invalidate,
        'error-callback': invalidate,
        'timeout-callback': invalidate,
      });
    }).catch(invalidate);
    return () => {
      active = false;
      if (widget !== undefined) api?.remove(widget);
    };
  }, [siteKey, action, fr, nonce, onToken, retry]);

  return <div className="contacts-verification" data-state={state}>
    <div ref={container} />
    <p className="contacts-verification-status" role="status" aria-live="polite">
      {state === 'verified' && <svg className="contacts-verification-check" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path d="m6 10 2.5 2.5L14 7" stroke="var(--paper)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>}
      <span>
        {state === 'verified'
          ? (fr ? 'Protection anti-robot active' : 'Bot protection active')
          : state === 'error'
            ? (fr ? 'La vérification anti-robot est indisponible ou a expiré. Réessayez ou écrivez-nous directement.' : 'Bot verification is unavailable or expired. Try again or email us directly.')
            : (fr ? 'Vérification anti-robot…' : 'Checking your browser…')}
      </span>
    </p>
    {state !== 'verified' && siteKey && <button type="button" className="contacts-verification-retry" onClick={() => setRetry((value) => value + 1)}>
      {fr ? 'Relancer la vérification' : 'Retry verification'}
    </button>}
    <noscript>{fr ? 'Activez JavaScript pour envoyer ce formulaire, ou écrivez-nous directement.' : 'Enable JavaScript to send this form, or email us directly.'}</noscript>
  </div>;
}
