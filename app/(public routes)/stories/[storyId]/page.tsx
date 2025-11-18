// app/(public routes)/stories/[storyId]/page.tsx

import { fetchStoryById } from '@/lib/api/clientApi';
import { StoryDetailsClient } from './routesStory.client';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import PopularSection from '@/components/PopularSection/PopularSection';
import styles from './page.module.css';

type Props = {
  params: { storyId: string };
};

export default async function StoryPage({ params }: Props) {
  const resolvedParams = await params;
  const { storyId } = resolvedParams;

  // Створюємо клієнт для prefetching даних
  const queryClient = new QueryClient();

  // Завантажуємо дані про конкретну історію з бекенду на сервері
  await queryClient.prefetchQuery({
    queryKey: ['story', storyId],
    queryFn: () => fetchStoryById(storyId),
  });

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            {/* Деталі історії */}
            <StoryDetailsClient storyId={storyId} />

            {/* Блок популярних статей */}
            <PopularSection />
          </HydrationBoundary>
        </div>
      </section>
    </main>
  );
}
