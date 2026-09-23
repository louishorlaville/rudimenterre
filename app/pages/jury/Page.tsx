import {EditorialTemplate} from '~/pages/editorial/Template';
import type {EditorialPageContent} from '~/lib/editorial-content';
import type {StorefrontLocale} from '~/lib/i18n';

export function JuryPage(props: {content: EditorialPageContent; locale: StorefrontLocale; heroImage?: {url: string; altText?: string | null} | null}) {
  return <EditorialTemplate {...props} />;
}
