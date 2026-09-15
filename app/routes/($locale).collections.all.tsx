import {redirect} from 'react-router';
import type {Route} from './+types/($locale).collections.all';

export async function loader({params}: Route.LoaderArgs) {
  throw redirect(`/${params.locale || 'fr'}/adoptez`);
}

export default function LegacyCatalogRedirect() {
  return null;
}
