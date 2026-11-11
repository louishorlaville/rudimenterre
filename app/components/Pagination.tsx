import {Link, useLocation, useNavigation, type LinkProps} from 'react-router';
import {type ReactNode} from 'react';
import {CollectionProvider} from '@shopify/hydrogen/react';

type PageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
};
export function getPaginationVariables(
  request: Request,
  {pageBy}: {pageBy: number},
) {
  const params = new URL(request.url).searchParams;
  const backwards = params.get('direction') === 'previous';
  return {
    first: backwards ? undefined : pageBy,
    last: backwards ? pageBy : undefined,
    startCursor: backwards ? params.get('cursor') : undefined,
    endCursor: backwards ? undefined : params.get('cursor'),
  };
}

// Cursor links remain real GET links; router history carries accumulated results.
export function Pagination<Node>({
  connection,
  children,
}: {
  connection: {nodes: Node[]; pageInfo: PageInfo};
  children: (props: {
    nodes: Node[];
    isLoading: boolean;
    PreviousLink: (props: Omit<LinkProps, 'to'>) => ReactNode;
    NextLink: (props: Omit<LinkProps, 'to'>) => ReactNode;
  }) => ReactNode;
}) {
  const location = useLocation();
  const navigation = useNavigation();
  const params = new URLSearchParams(location.search);
  params.delete('cursor');
  params.delete('direction');
  const key = `${location.pathname}?${params}`;
  const history = location.state?.pagination as
    | {key: string; previous: Node[]; next: Node[]; pageInfo: PageInfo}
    | undefined;
  const previous = history?.key === key ? history.previous : [];
  const next = history?.key === key ? history.next : [];
  const nodes = [...previous, ...connection.nodes, ...next];
  const pageInfo = {
    ...connection.pageInfo,
    ...(previous.length
      ? {
          hasPreviousPage: history!.pageInfo.hasPreviousPage,
          startCursor: history!.pageInfo.startCursor,
        }
      : {}),
    ...(next.length
      ? {
          hasNextPage: history!.pageInfo.hasNextPage,
          endCursor: history!.pageInfo.endCursor,
        }
      : {}),
  };
  const links = (() => {
    function CursorLink({
      backwards,
      ...props
    }: Omit<LinkProps, 'to'> & {backwards: boolean}) {
      const available = backwards
        ? pageInfo.hasPreviousPage
        : pageInfo.hasNextPage;
      if (!available) return null;
      const query = new URLSearchParams(location.search);
      query.set(
        'cursor',
        (backwards ? pageInfo.startCursor : pageInfo.endCursor) ?? '',
      );
      query.set('direction', backwards ? 'previous' : 'next');
      return (
        <Link
          {...props}
          to={`?${query}`}
          preventScrollReset
          state={{
            pagination: {
              key,
              pageInfo,
              previous: backwards ? [] : nodes,
              next: backwards ? nodes : [],
            },
          }}
        />
      );
    }
    return {
      PreviousLink: (props: Omit<LinkProps, 'to'>) => (
        <CursorLink {...props} backwards />
      ),
      NextLink: (props: Omit<LinkProps, 'to'>) => (
        <CursorLink {...props} backwards={false} />
      ),
    };
  })();
  return (
    <CollectionProvider
      data={{handle: key, dataSearch: location.search}}
      urlSearch={location.search}
    >
      {children({...links, nodes, isLoading: navigation.state !== 'idle'})}
    </CollectionProvider>
  );
}
