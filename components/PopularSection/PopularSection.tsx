// components/PopularSection/PopularSection.tsx
export const dynamic = 'force-dynamic';

import { fetchAllStoriesServer, getMeServer } from '@/lib/api/serverApi';
import PopularSectionClient from './PopularSection.client';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { StoriesResponse } from '@/types/story';

interface UserResponse {
  selectedStories: string[];
}

type PopularSectionProps = {
  page?: number;
  perPage?: number;
  sortOrder?: string;
  sortField?: string;
};

const INITIAL_PER_PAGE = 4;

export default async function PopularSection({
  page = 1,
  perPage = INITIAL_PER_PAGE,
  sortField = 'favoriteCount',
  sortOrder = 'desc',
}: PopularSectionProps) {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['stories', page, perPage, sortField, sortOrder],
      queryFn: () =>
        fetchAllStoriesServer({ page, perPage, sortField, sortOrder }),
    });
  } catch (error) {
    console.error('SERVER ERROR: Failed to prefetch stories.', error);
  }
  // 🛑 FIX APPLIED HERE: Wrapped getMeServer in an anonymous function.
  try {
    await queryClient.prefetchQuery({
      queryKey: ['user'],
      queryFn: () => getMeServer(), // This matches the required QueryFn signature
    });
  } catch (error) {
    console.error(
      'SERVER ERROR: Failed to prefetch user data (expected 401).',
      error
    );
  }

  const initialData = queryClient.getQueryData<StoriesResponse>([
    'stories',
    page,
    perPage,
    sortField,
    sortOrder,
  ]);

  const initialUserData = queryClient.getQueryData<UserResponse>(['user']);

  if (!initialData) {
    return <p>Немає даних для популярних історій</p>;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
           {' '}
      <PopularSectionClient
        initialData={initialData}
        initialUser={initialUserData?.selectedStories}
        sortField={sortField}
        sortOrder={sortOrder}
      />
         {' '}
    </HydrationBoundary>
  );
}
