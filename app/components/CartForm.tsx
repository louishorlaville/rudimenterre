import {useEffect, useRef, type ReactNode} from 'react';
import {useFetcher, useLocation} from 'react-router';
import {localeFromPathname} from '~/lib/i18n';
import {useCart, useCartActions, useCartForm} from '~/lib/cart';
import {useCartNotification} from './CartNotification';

const ACTIONS = {
  LinesAdd: 'LinesAdd',
  LinesUpdate: 'LinesUpdate',
  LinesRemove: 'LinesRemove',
  DiscountCodesUpdate: 'DiscountCodesUpdate',
  GiftCardCodesAdd: 'GiftCardCodesAdd',
  GiftCardCodesRemove: 'GiftCardCodesRemove',
  BuyerIdentityUpdate: 'BuyerIdentityUpdate',
} as const;
type Inputs = {
  lines?: Array<{
    id?: string;
    merchandiseId?: string;
    quantity?: number;
    selectedVariant?: unknown;
  }>;
  lineIds?: string[];
  discountCodes?: string[];
  discountCode?: string;
  giftCardCodes?: string[];
  giftCardCode?: string;
  buyerIdentity?: Record<string, unknown>;
};
type Props = {
  action: string;
  inputs?: Inputs;
  children: ReactNode;
  route?: string;
  fetcherKey?: string;
};

function StoreCartForm({action, inputs = {}, children}: Props) {
  const {formProps} = useCartForm();
  const notifyAddition = useCartNotification();
  const line = inputs.lines?.[0];
  const intent =
    action === ACTIONS.LinesAdd
      ? 'add'
      : action === ACTIONS.LinesUpdate
        ? 'set'
        : action === ACTIONS.LinesRemove
          ? 'remove'
          : inputs.discountCodes?.length
            ? 'discount-apply'
            : 'discount-remove';
  return (
    <form
      {...formProps({
        beforeSubmit: () => {
          if (action === ACTIONS.LinesAdd && line?.merchandiseId) {
            notifyAddition(line.merchandiseId);
          }
        },
      })}
    >
      <input type="hidden" name="intent" value={intent} />
      {line?.merchandiseId && (
        <input type="hidden" name="merchandiseId" value={line.merchandiseId} />
      )}
      {(line?.id || inputs.lineIds?.[0]) && (
        <input
          type="hidden"
          name="lineId"
          value={line?.id || inputs.lineIds?.[0]}
        />
      )}
      {line?.quantity !== undefined && (
        <input type="hidden" name="quantity" value={line.quantity} />
      )}
      {intent === 'discount-remove' && (
        <input
          type="hidden"
          name="discountCode"
          value={inputs.discountCodes?.[0] ?? ''}
        />
      )}
      {children}
    </form>
  );
}
function GiftCardForm({action, inputs, children, route, fetcherKey}: Props) {
  const fetcher = useFetcher({key: fetcherKey});
  const locale = localeFromPathname(useLocation().pathname);
  const {refresh} = useCartActions();
  const submitted = useRef(false);
  useEffect(() => {
    if (fetcher.state !== 'idle') submitted.current = true;
    else if (submitted.current) {
      submitted.current = false;
      refresh();
    }
  }, [fetcher.state, refresh]);
  return (
    <fetcher.Form method="post" action={route ?? `/${locale}/cart`}>
      <input
        type="hidden"
        name="cartFormInput"
        value={JSON.stringify({action, inputs: inputs ?? {}})}
      />
      {children}
    </fetcher.Form>
  );
}
export function CartForm(props: Props) {
  return props.action === ACTIONS.GiftCardCodesAdd ||
    props.action === ACTIONS.GiftCardCodesRemove ||
    props.action === ACTIONS.DiscountCodesUpdate ? (
    <GiftCardForm {...props} />
  ) : (
    <StoreCartForm {...props} />
  );
}
CartForm.ACTIONS = ACTIONS;
CartForm.getFormInput = (form: FormData): {action?: string; inputs: Inputs} => {
  const raw = form.get('cartFormInput');
  const parsed =
    typeof raw === 'string'
      ? (JSON.parse(raw) as {action?: string; inputs?: Inputs})
      : {};
  return {
    action: parsed.action,
    inputs: {
      ...parsed.inputs,
      discountCode: String(form.get('discountCode') ?? ''),
      giftCardCode: String(form.get('giftCardCode') ?? ''),
    },
  };
};

export function CartPendingButton({
  disabled,
  children,
  onClick,
}: {
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pending = useCart((state) => state.pending.lines.size > 0);
  return (
    <button
      type="submit"
      name="intent"
      value="add"
      disabled={Boolean(disabled || pending)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
