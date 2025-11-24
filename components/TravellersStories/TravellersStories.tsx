'use client';
import {
  hydrate,
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Loader from '../Loader/Loader';
import { showErrorToast } from '../ShowErrorToast/ShowErrorToast';
import { StoriesResponse } from '@/types/story';
import styles from '../../app/(private routes)/profile/[pageType]/ProfileOwnPage.module.css';
import TravellersStoriesItem from '../TravellersStoriesItem/TravellersStoriesItem';
import { fetchOwnStoriesClient } from '@/lib/api/clientApi';
import MessageNoStories from '../MessageNoStories/MessageNoStories';

type StoriesClientProps = {
  filter: string;
  dehydratedState: unknown;
};

function StoriesList({ filter }: { filter: string }) {
  const [currentPerPage, setCurrentPerPage] = useState(9);

  useEffect(() => {
    const calculatePerPage = () => {
      const width = window.innerWidth;
      if (width >= 768 && width < 1440) return 8;
      return 9;
    };
    setCurrentPerPage(calculatePerPage());
    const handleResize = () => setCurrentPerPage(calculatePerPage());
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<StoriesResponse, Error>({
    queryKey: ['stories', currentPerPage, filter],
    queryFn: async (context) => {
      const page = context.pageParam as number;

      return fetchOwnStoriesClient({ page, perPage: currentPerPage, filter });
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.hasNextPage ? lastPage.data.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Помилка
  useEffect(() => {
    if (isError) {
      showErrorToast('Something went wrong while fetching stories.');
    }
  }, [isError]);

  const hasStories = data?.pages.some((page) => page.data.data.length > 0);

  return (
    <>
      {hasStories ? (
        <>
          {data && (
            <ul className={styles.storyList}>
              {data.pages.flatMap((page) => {
                return page.data.data.map((story) => (
                  <li className={styles.storyItem} key={story._id}>
                    <TravellersStoriesItem story={story} />
                  </li>
                ));
              })}
            </ul>
          )}
          {hasNextPage && (
            <div className={styles.loadMoreWrap}>
              <button
                className={styles.loadMoreBtn}
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Завантаження...' : 'Переглянути ще'}
              </button>
            </div>
          )}
          {isLoading && <Loader />}
        </>
      ) : (
        <MessageNoStories
          text={'Автор ще нічого не опублікував'}
          buttonText={'Повернутися до інших авторів'}
          route="/travellers"
        />
      )}
    </>
  );
}

export default function StoriesClient({
  filter,
  dehydratedState,
}: StoriesClientProps) {
  const [queryClient] = useState(() => new QueryClient());
  useEffect(() => {
    hydrate(queryClient, dehydratedState);
  }, [queryClient, dehydratedState]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoriesList filter={filter} />
    </QueryClientProvider>
  );
}
