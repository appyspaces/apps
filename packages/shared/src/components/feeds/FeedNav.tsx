import classNames from 'classnames';
import React, { ReactElement, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { useActiveFeedNameContext } from '../../contexts';
import useActiveNav from '../../hooks/useActiveNav';
import { useViewSize, ViewSize } from '../../hooks';
import usePersistentContext from '../../hooks/usePersistentContext';
import {
  algorithmsList,
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
} from '../layout/common';
import { MobileFeedActions } from './MobileFeedActions';
import { useFeedName } from '../../hooks/feed/useFeedName';
import SettingsContext from '../../contexts/SettingsContext';
import { Dropdown } from '../fields/Dropdown';
import { PlusIcon, SortIcon } from '../icons';
import { IconSize } from '../Icon';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { webappUrl } from '../../lib/constants';
import { FEED_LIST_QUERY, FeedList } from '../../graphql/feed';
import { graphqlUrl } from '../../lib/config';
import { RequestKey, StaleTime, generateQueryKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

enum FeedNavTab {
  ForYou = 'For you',
  Popular = 'Popular',
  Bookmarks = 'Bookmarks',
  History = 'History',
  MostUpvoted = 'Most Upvoted',
  Discussions = 'Discussions',
  NewFeed = 'New feed',
}

function FeedNav(): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { feedName } = useActiveFeedNameContext();
  const { sortingEnabled } = useContext(SettingsContext);
  const { isSortableFeed } = useFeedName({ feedName });
  const { home: shouldRenderNav } = useActiveNav(feedName);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });

  const { data: userFeeds } = useQuery(
    generateQueryKey(RequestKey.Feeds, user),
    async () => {
      const result = await request<FeedList>(graphqlUrl, FEED_LIST_QUERY);

      return result.feedList;
    },
    {
      enabled: !!user,
      staleTime: StaleTime.OneHour,
    },
  );

  const urlToTab: Record<string, FeedNavTab> = useMemo(() => {
    const customFeeds = userFeeds?.edges?.reduce((acc, { node: feed }) => {
      const feedPath = `${webappUrl}feeds/${feed.slug}`;
      const isEditingFeed =
        router.query.slug === feed.slug && router.pathname.endsWith('/edit');
      const urlPath = `${feedPath}${isEditingFeed ? '/edit' : ''}`;

      acc[urlPath] = feed.flags?.name || `Feed ${feed.id}`;

      return acc;
    }, {});

    return {
      [`${webappUrl}feeds/new`]: FeedNavTab.NewFeed,
      [`${webappUrl}`]: FeedNavTab.ForYou,
      ...customFeeds,
      [`${webappUrl}popular`]: FeedNavTab.Popular,
      [`${webappUrl}upvoted`]: FeedNavTab.MostUpvoted,
      [`${webappUrl}discussed`]: FeedNavTab.Discussions,
      [`${webappUrl}bookmarks`]: FeedNavTab.Bookmarks,
      [`${webappUrl}history`]: FeedNavTab.History,
    };
  }, [userFeeds, router.pathname, router.query.slug]);

  if (!shouldRenderNav || router?.pathname?.startsWith('/posts/[id]')) {
    return null;
  }

  return (
    <div
      className={classNames(
        'sticky top-0 z-header w-full tablet:pl-16',
        scrollClassName,
      )}
    >
      {isMobile && <MobileFeedActions />}
      <div className="mb-4 h-[3.25rem] tablet:mb-0">
        <TabContainer
          controlledActive={urlToTab[router.asPath] ?? ''}
          shouldMountInactive
          className={{
            header: classNames(
              'no-scrollbar overflow-x-auto px-2',
              isSortableFeed && sortingEnabled && 'pr-28',
            ),
          }}
          tabListProps={{
            className: { indicator: '!w-6', item: 'px-1' },
            autoScrollActive: true,
          }}
          renderTab={({ label }) => {
            if (label === FeedNavTab.NewFeed) {
              return (
                <div className="flex size-6 items-center justify-center rounded-6 bg-background-subtle">
                  <PlusIcon />
                </div>
              );
            }

            return null;
          }}
        >
          {Object.entries(urlToTab).map(([url, label]) => (
            // key is assigned automatically in the Tab component
            // eslint-disable-next-line react/jsx-key
            <Tab label={label} url={url} />
          ))}
        </TabContainer>

        {isMobile && sortingEnabled && isSortableFeed && (
          <div className="sticky flex h-11 w-20 -translate-y-12 translate-x-[calc(100vw-100%)] items-center justify-end bg-gradient-to-r from-transparent via-background-default via-40% to-background-default pr-4">
            <Dropdown
              className={{
                label: 'hidden',
                chevron: 'hidden',
                button: '!px-1',
              }}
              dynamicMenuWidth
              shouldIndicateSelected
              buttonSize={ButtonSize.Small}
              buttonVariant={ButtonVariant.Tertiary}
              icon={<SortIcon size={IconSize.Medium} />}
              selectedIndex={selectedAlgo}
              options={algorithmsList}
              onChange={(_, index) => setSelectedAlgo(index)}
              drawerProps={{ displayCloseButton: true }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedNav;
