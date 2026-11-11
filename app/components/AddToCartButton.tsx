import type {ReactNode} from 'react';
import type {OptimisticCartLineInput} from '~/lib/cart-types';
import {CartForm, CartPendingButton} from './CartForm';

export function AddToCartButton({
  children,
  disabled,
  lines,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  lines: OptimisticCartLineInput[];
  onClick?: () => void;
}) {
  return (
    <CartForm action={CartForm.ACTIONS.LinesAdd} inputs={{lines}}>
      <CartPendingButton disabled={disabled || !lines.length} onClick={onClick}>
        {children}
      </CartPendingButton>
    </CartForm>
  );
}
