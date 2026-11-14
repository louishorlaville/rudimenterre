import {redirect, type LoaderFunctionArgs} from 'react-router';
export {action} from '~/pages/newsletter/action.server';

export function loader({request, params}: LoaderFunctionArgs) {
  return redirect(`/${params.locale || 'fr'}/newsletter${new URL(request.url).search}`, 301);
}
