import type {MetaFunction} from 'react-router';
import ContactsPage from '~/pages/contacts/Page';

export {links} from '~/pages/contacts/Page';

export const meta: MetaFunction = ({params}) => [
  {title: `${params.locale === 'en' ? 'Press and media' : 'Presse et médias'} | Rudimenterre`},
  {name: 'description', content: params.locale === 'en'
    ? 'Contact Rudimenterre for press enquiries, interviews, features and images of Cuicui.'
    : 'Contactez Rudimenterre pour vos demandes de presse, entrevues, reportages et visuels du Cuicui.'},
];

export default function PressPage() {
  return <ContactsPage press />;
}
