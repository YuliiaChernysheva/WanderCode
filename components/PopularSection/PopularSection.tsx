export const dynamic = 'force-dynamic';

import { fetchAllStoriesServer, getMeServer } from '@/lib/api/serverApi';
import PopularSectionClient from './PopularSection.client';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { StoriesResponse } from '@/types/story';

// 💡 Вызначце тып, які вяртаецца функцыяй getMeServer
interface UserResponse {
  selectedStories: string[];
  // Дадайце ўсе іншыя неабходныя палі тут
  // напрыклад: _id: string; email: string;
}

type PopularSectionProps = {
  page?: number;
  perPage?: number;
  sortOrder?: string;
  sortField?: string;
};

export default async function PopularSection({
  page = 1,
  perPage = 3,
  sortField = 'favoriteCount',
  sortOrder = 'desc',
}: PopularSectionProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['stories', page, perPage, sortField, sortOrder],
    queryFn: () =>
      fetchAllStoriesServer({ page, perPage, sortField, sortOrder }),
  });

  await queryClient.prefetchQuery({
    queryKey: ['user'],
    queryFn: getMeServer,
  });

  const initialData = queryClient.getQueryData<StoriesResponse>([
    'stories',
    page,
    perPage,
    sortField,
    sortOrder,
  ]);

  // 💡 Выкарыстоўваем канкрэтны тып UserResponse
  const initialUserData = queryClient.getQueryData<UserResponse>(['user']);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PopularSectionClient
        initialData={initialData!}
        initialUser={initialUserData?.selectedStories}
        perPage={perPage}
        sortField={sortField}
        sortOrder={sortOrder}
      />
    </HydrationBoundary>
  );
}
