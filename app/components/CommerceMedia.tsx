import type {ComponentProps} from 'react';
import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';
import {formatMoney} from '@shopify/hydrogen';

type ImageData = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};
function imageUrl(source: string, width?: number, height?: number) {
  try {
    const url = new URL(source);
    if (
      !['cdn.shopify.com', 'mock.shop'].some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    )
      return source;
    if (width) url.searchParams.set('width', String(width));
    if (height) url.searchParams.set('height', String(height));
    return url.href;
  } catch {
    return source;
  }
}
export function Image({
  data: image,
  src,
  aspectRatio,
  srcSetOptions,
  width,
  height,
  alt,
  style,
  ...props
}: ComponentProps<'img'> & {
  data?: ImageData;
  aspectRatio?: string;
  srcSetOptions?: {
    startingWidth: number;
    intervals: number;
    incrementSize: number;
    placeholderWidth?: number;
  };
}) {
  const data = image ?? {url: src ?? ''};
  if (!data.url) return null;
  const targetWidth = Number(width) || data.width || undefined;
  const targetHeight = Number(height) || data.height || undefined;
  const widths = srcSetOptions
    ? Array.from(
        {length: srcSetOptions.intervals},
        (_, index) =>
          srcSetOptions.startingWidth + index * srcSetOptions.incrementSize,
      )
    : [320, 640, 960, 1280, 1920].filter(
        (size) => !data.width || size <= data.width,
      );
  return (
    <img
      {...props}
      src={imageUrl(data.url, targetWidth)}
      srcSet={
        props.srcSet ??
        (widths.length
          ? widths
              .map((size) => `${imageUrl(data.url, size)} ${size}w`)
              .join(', ')
          : undefined)
      }
      alt={alt ?? data.altText ?? ''}
      width={targetWidth}
      height={targetHeight}
      style={{...style, ...(aspectRatio ? {aspectRatio} : {})}}
    />
  );
}
export function Money({
  data,
  ...props
}: Omit<ComponentProps<'span'>, 'children'> & {
  data?: {amount: string; currencyCode: string} | null;
}) {
  const root = useRouteLoaderData<RootLoader>('root');
  if (!data) return null;
  const locale = `${root?.locale ?? 'fr'}-${root?.i18n.country ?? 'CA'}`;
  return <span {...props}>{formatMoney(data, {locale}).localizedString}</span>;
}
