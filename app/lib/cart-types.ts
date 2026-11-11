import type {CartApiQueryFragment} from 'storefrontapi.generated';
export type OptimisticCart<T> = T extends null
  ? null
  : T & {isOptimistic?: boolean};
export type OptimisticCartLine<T> = T extends CartApiQueryFragment
  ? CartApiQueryFragment['lines']['nodes'][number] & {isOptimistic?: boolean}
  : never;
export type OptimisticCartLineInput = {
  merchandiseId: string;
  quantity: number;
  selectedVariant?: unknown;
};
