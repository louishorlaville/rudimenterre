import {redirect, type LoaderFunctionArgs} from 'react-router';
export {action} from '~/pages/contacts/action.server';

export function loader({request, params}: LoaderFunctionArgs) {
  return redirect(`/${params.locale || 'fr'}/presse-medias${new URL(request.url).search}`, 301);
}
