import { useCallback } from 'react';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { SourcePostModeration } from '../../graphql/squads';
import {
  SourcePostModerationStatus,
  SQUAD_PENDING_POSTS_QUERY,
} from '../../graphql/squads';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';

type UseSquadPendingPosts = UseInfiniteQueryResult<
  InfiniteData<Connection<SourcePostModeration[]>>
>;

export const useSquadPendingPosts = (
  squadId: string,
  status: SourcePostModerationStatus[] = [SourcePostModerationStatus.Pending],
): UseSquadPendingPosts => {
  const { user } = useAuthContext();

  return useInfiniteQuery<Connection<SourcePostModeration[]>>({
    queryKey: generateQueryKey(RequestKey.SquadPostRequests, user, squadId),
    queryFn: async ({ pageParam }) => {
      return gqlClient
        .request<{
          sourcePostModerations: Connection<SourcePostModeration[]>;
        }>(SQUAD_PENDING_POSTS_QUERY, {
          sourceId: squadId,
          status,
          after: pageParam,
        })
        .then((res) => res.sourcePostModerations);
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    enabled: !!squadId,
    select: useCallback((res) => {
      if (!res) {
        return undefined;
      }

      return {
        ...res,
        // filter out last page with no edges returned by api paginator
        pages: res.pages.filter((pageItem) => !!pageItem?.edges.length),
      };
    }, []),
  });
};
