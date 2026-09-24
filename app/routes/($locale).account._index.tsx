import {redirect} from 'react-router';
import type {Route} from './+types/($locale).account._index';

export async function loader({params}: Route.LoaderArgs) {
  return redirect(`/${params.locale || 'fr'}/account/orders`);
}
