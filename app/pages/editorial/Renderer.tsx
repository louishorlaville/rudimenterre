import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';
import {AdoptPage} from '~/pages/adopt/Page';
import {RecipePage} from '~/pages/creator/Page';
import {SteamPage} from '~/pages/steam/Page';
import {ProjectPage} from '~/pages/project/Page';
import {DistillationPage, DistillationFallbackPage} from '~/pages/distillation/Page';
import {GardenPage} from '~/pages/garden/Page';
import {MakingPage} from '~/pages/making/Page';
import {ThermalPage} from '~/pages/thermal/Page';
import {JuryPage} from '~/pages/jury/Page';
import {ShippingPage} from '~/pages/shipping/Page';

export function EditorialPage(props: {
  content: EditorialPageContent;
  locale: StorefrontLocale;
  heroImage?: {url: string; altText?: string | null} | null;
}) {
  const {content, locale, heroImage} = props;
  switch (content.id) {
    case 'adopt': return <AdoptPage locale={locale} />;
    case 'creator': return <RecipePage locale={locale} heroImage={heroImage} />;
    case 'steam': return <SteamPage locale={locale} heroImage={heroImage} />;
    case 'project': return <ProjectPage {...props} />;
    case 'distillation': return locale === 'fr' ? <DistillationPage /> : <DistillationFallbackPage {...props} />;
    case 'garden': return <GardenPage {...props} />;
    case 'making': return <MakingPage {...props} />;
    case 'thermal': return <ThermalPage {...props} />;
    case 'jury': return <JuryPage {...props} />;
    case 'shipping': return <ShippingPage {...props} />;
  }
}
