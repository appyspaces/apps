import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Logo, { LogoPosition } from '../Logo';
import { ReadingStreakButton } from '../streak/ReadingStreakButton';
import { Divider, SharedFeedPage } from '../utilities';
import MyFeedHeading from '../filters/MyFeedHeading';
import { LazyModal } from '../modals/common/types';
import NotificationsBell from '../notifications/NotificationsBell';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useReadingStreak } from '../../hooks/streaks';
import { ButtonIconPosition } from '../buttons/common';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { getFeedName } from '../../lib/feed';

export function MobileFeedActions(): ReactElement {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { streak, isLoading } = useReadingStreak();
  const featureTheme = useFeatureTheme();

  return (
    <div className="flex flex-row justify-between px-4 py-1">
      <Logo
        showGreeting={false}
        position={LogoPosition.Relative}
        onLogoClick={() => router.push('/')}
        featureTheme={featureTheme}
      />
      <span className="flex flex-row items-center gap-2">
        <ReadingStreakButton
          isLoading={isLoading}
          streak={streak}
          compact
          iconPosition={ButtonIconPosition.Right}
        />
        <Divider className="bg-border-subtlest-tertiary" vertical />
        <MyFeedHeading
          onOpenFeedFilters={() => {
            const feedName = getFeedName(router.pathname);

            if (feedName === SharedFeedPage.Custom && router.query.slug) {
              router.replace(`/feeds/${router.query.slug}/edit`);
            } else {
              openModal({
                type: LazyModal.FeedFilters,
                persistOnRouteChange: true,
              });
            }
          }}
        />
        <NotificationsBell compact />
      </span>
    </div>
  );
}
