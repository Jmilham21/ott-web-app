import React, { memo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { formatDurationTag, formatLocalizedDateTime, formatSeriesMetaString } from '@jwp/ott-common/src/utils/formatting';
import { isLiveChannel, isSeries } from '@jwp/ott-common/src/utils/media';
import { MediaStatus } from '@jwp/ott-common/src/utils/liveEvent';
import Lock from '@jwp/ott-theme/assets/icons/lock.svg?react';
import Today from '@jwp/ott-theme/assets/icons/today.svg?react';

import Image from '../Image/Image';
import Tag from '../Tag/Tag';
import Icon from '../Icon/Icon';

import styles from './VideoListItem.module.scss';

type VideoListItemProps = {
  onHover?: () => void;
  item: PlaylistItem;
  progress?: number;
  loading?: boolean;
  isActive?: boolean;
  activeLabel?: string;
  isLocked?: boolean;
  url: string;
};

function VideoListItem({ onHover, progress, activeLabel, item, url, loading = false, isActive = false, isLocked = true }: VideoListItemProps): JSX.Element {
  const { title, duration, seasonNumber, episodeNumber, cardImage: image, mediaStatus, scheduledStart } = item;

  const {
    t,
    i18n: { language },
  } = useTranslation('common');
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterImageClassNames = classNames(styles.posterImage, {
    [styles.visible]: imageLoaded,
  });

  const isSeriesItem = isSeries(item);
  const isLive = mediaStatus === MediaStatus.LIVE || isLiveChannel(item);
  const isScheduled = mediaStatus === MediaStatus.SCHEDULED;

  const renderTagLabel = () => {
    if (loading || !title) return null;

    if (isSeriesItem) {
      return t('series');
    } else if (seasonNumber && episodeNumber) {
      return formatSeriesMetaString(seasonNumber, episodeNumber);
    } else if (duration) {
      return formatDurationTag(duration);
    } else if (isLive) {
      return t('live');
    } else if (isScheduled) {
      return (
        <>
          <Icon icon={Today} className={styles.scheduled} />
          {t('scheduled')}
        </>
      );
    }
  };

  return (
    <Link to={url} className={styles.listItem} onMouseEnter={onHover} aria-label={title} tabIndex={0}>
      <div className={styles.poster}>
        <Image className={posterImageClassNames} image={image} alt={title} onLoad={() => setImageLoaded(true)} width={320} />
        {isActive && <div className={styles.activeLabel}>{activeLabel}</div>}
        <div className={styles.tags}>
          {isLocked && <Icon icon={Lock} className={styles.lock} />}
          <Tag className={classNames(styles.tag, { [styles.live]: isLive })}>{renderTagLabel()}</Tag>
        </div>

        {progress ? (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
      </div>
      <div className={styles.metadata}>
        {!!scheduledStart && <div className={styles.scheduledStart}>{formatLocalizedDateTime(scheduledStart, language)}</div>}
        <div className={styles.title}>{title}</div>
      </div>
    </Link>
  );
}

export default memo(VideoListItem);
