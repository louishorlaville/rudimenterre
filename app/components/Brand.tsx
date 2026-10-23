import {useRef, type PointerEvent as ReactPointerEvent} from 'react';
import {Link} from 'react-router';

const BRAND_NAME = 'RUDIMENTERRE';

export function Brand({locale}: {locale: string}) {
  const brandRef = useRef<HTMLAnchorElement>(null);

  function handleBrandPointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === 'touch' || !brandRef.current) return;

    const brand = brandRef.current;
    const letters = brand.querySelectorAll<HTMLElement>('.brand-letter');
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    brand.classList.add('brand--tracking');
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const deltaX = pointerX - (rect.left + rect.width / 2);
      const deltaY = pointerY - (rect.top + rect.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      const influence = Math.max(0, 1 - distance / 72);
      const directionX = distance ? -deltaX / distance : 0;
      const directionY = distance ? -deltaY / distance : -1;
      const shiftX = directionX * influence * 6;
      const shiftY = directionY * influence * 4;
      const rotation = directionX * influence * 7;

      letter.style.setProperty('--brand-shift-x', `${shiftX.toFixed(2)}px`);
      letter.style.setProperty('--brand-shift-y', `${shiftY.toFixed(2)}px`);
      letter.style.setProperty('--brand-rotation', `${rotation.toFixed(2)}deg`);
    });
  }

  function resetBrandPointer() {
    const brand = brandRef.current;
    if (!brand) return;

    brand.classList.remove('brand--tracking');
    brand.querySelectorAll<HTMLElement>('.brand-letter').forEach((letter) => {
      letter.style.removeProperty('--brand-shift-x');
      letter.style.removeProperty('--brand-shift-y');
      letter.style.removeProperty('--brand-rotation');
    });
  }
  return (
    <Link className="brand" ref={brandRef} onPointerMove={handleBrandPointerMove} onPointerLeave={resetBrandPointer} onPointerCancel={resetBrandPointer} prefetch="intent" to={`/${locale}`}>
      <span className="brand-word" aria-label={BRAND_NAME}>
        {BRAND_NAME.split('').map((letter, index) => (
          <span className="brand-letter" key={`${letter}-${index}`} aria-hidden="true">{letter}</span>
        ))}
      </span>
      <sup className="brand-mark" aria-hidden="true">®</sup>
    </Link>
  );
}
