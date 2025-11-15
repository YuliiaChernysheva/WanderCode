// components/TravellersStories/TravellersStories.tsx
'use client';

import { useMemo, useEffect } from 'react';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { fetchStoriesPage, StoriesPage } from '@/lib/api/clientApi';
import Loader from '@/components/Loader/Loader';
import StoriesList from '@/components/StoriesList/StoriesList';
import { showErrorToast } from '@/components/ShowErrorToast/ShowErrorToast';
import { Story } from '@/types/story';

const TravellersStories = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    StoriesPage,
    Error,
    InfiniteData<StoriesPage, number>,
    readonly unknown[],
    number
  >({
    queryKey: ['stories'],
    queryFn: fetchStoriesPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const allStories: Story[] = useMemo(() => {
    return data?.pages.flatMap((page) => page.stories) ?? [];
  }, [data]);

  useEffect(() => {
    if (isError) {
      const message =
        error instanceof Error
          ? error.message
          : 'Сталася памылка пры запісе дадзеных';
      showErrorToast(message);
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="stories-loader">
        <Loader />
      </div>
    );
  }

  if (!allStories.length) {
    return (
      <div className="stories-empty">
        <h2 className="stories-empty__title">Пакуль што няма гісторый</h2>
        <p className="stories-empty__text">
          Станьце першым, хто падзеліцца ўласным падарожжам і натхніць іншых!
        </p>
      </div>
    );
  }

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <section className="stories">
      <StoriesList stories={allStories} />

      {hasNextPage && (
        <div className="stories__load-more-wrap">
          <button
            type="button"
            className="stories__load-more-btn"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Загрузка...' : 'Перагледзець яшчэ'}
          </button>
        </div>
      )}
    </section>
  );
};

export default TravellersStories;
