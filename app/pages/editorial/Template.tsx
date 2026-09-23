import {Link} from 'react-router';
import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

export function EditorialTemplate({content, locale, heroImage}: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  return <article className="editorial-page">
    <header className="editorial-hero">
      <img className="editorial-hero__image" src={heroImage?.url || content.heroImage} alt={heroImage?.altText || ''} style={{objectPosition: content.heroPosition || 'center'}} />
      <div className="editorial-hero__shade" />
      <div className="editorial-hero__copy">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="editorial-intro">{content.intro}</p>
      </div>
    </header>
    <div className="editorial-sections">
      {content.sections.map((section, index) => <section className="editorial-section" data-tone={section.tone || 'cream'} key={section.title}>
        <p className="editorial-section__number">{String(index + 1).padStart(2, '0')}</p>
        <div className="editorial-section__copy">
          <h2>{section.title}</h2>
          <p>{section.body}</p>
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </div>
        {section.image && <img className="editorial-section__image" src={section.image} alt={section.imageAlt || ''} loading="lazy" />}
      </section>)}
    </div>
    <footer className="editorial-next">
      <p>{locale === 'fr' ? 'Empilez · distillez · savourez' : 'Stack · distil · savour'}</p>
      <Link to={`/${locale}/adoptez`} className="button button--orange">{locale === 'fr' ? 'Adoptez' : 'Adopt'}</Link>
    </footer>
  </article>;
}
