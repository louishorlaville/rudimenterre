import {useEffect} from 'react';
import {useLocation} from 'react-router';
import {
  AnalyticsEvent,
  type ProductViewPayload,
  type CollectionViewPayload,
  type SearchViewPayload,
} from '@shopify/hydrogen';
import {useCartAnalytics} from '@shopify/hydrogen/react';

export function AnalyticsTracker() {
  const {pathname, search} = useLocation();
  useCartAnalytics();
  useEffect(() => {
    window.Shopify?.analytics?.publish(AnalyticsEvent.PAGE_VIEWED, {});
  }, [pathname, search]);
  return null;
}
function ProductView({data}: {data: ProductViewPayload}) {
  const {pathname, search} = useLocation();
  const key = JSON.stringify(data);
  useEffect(() => {
    window.Shopify?.analytics?.publish(
      AnalyticsEvent.PRODUCT_VIEWED,
      JSON.parse(key) as ProductViewPayload,
    );
  }, [pathname, search, key]);
  return null;
}
function CollectionView({data}: {data: CollectionViewPayload}) {
  const {pathname} = useLocation();
  const key = JSON.stringify(data);
  useEffect(() => {
    window.Shopify?.analytics?.publish(
      AnalyticsEvent.COLLECTION_VIEWED,
      JSON.parse(key) as CollectionViewPayload,
    );
  }, [pathname, key]);
  return null;
}
function SearchView({data}: {data: SearchViewPayload}) {
  const {pathname, search} = useLocation();
  const key = JSON.stringify(data);
  useEffect(() => {
    const payload = JSON.parse(key) as SearchViewPayload;
    if (payload.searchTerm)
      window.Shopify?.analytics?.publish(AnalyticsEvent.SEARCH_VIEWED, payload);
  }, [pathname, search, key]);
  return null;
}
export const Analytics = {ProductView, CollectionView, SearchView};
