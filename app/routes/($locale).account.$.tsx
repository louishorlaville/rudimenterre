import {redirect} from 'react-router';
import type {Route} from './+types/($locale).account.$';

export async function loader({context, params}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return redirect(`/${params.locale || 'fr'}/account`);
}
