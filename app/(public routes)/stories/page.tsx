// app/(public routes)/stories/page.tsx
import React from 'react';
import Container from '@/components/Container/Container';

import { Metadata } from 'next';
import css from './StoriesPage.module.css';
import {
  fetchAllStoriesServer,
  fetchCategoriesServer,
} from '@/lib/api/serverApi';

import StoriesClient from '@/components/Stories/Stories.client';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { Story } from '@/types/story';
import type { CategoryResponse } from '@/types/story';

export const dynamic = 'force-dynamic';
type StoriesPage = {
  data: {
    data: Story[]; // масив сторіз
    page: number; // номер сторінки
    hasNextPage: boolean;
  };
};

export const metadata: Metadata = {
  title: 'Всі Історії Мандрівників | WanderCode',
  description:
    'Перегляньте повний архів автентичних історій від спільноти Wander Code. Надихайтеся новими маршрутами, порадами та враженнями з усього світу.',
  keywords: [
    'всі історії',
    'архів подорожей',
    'блоги мандрівників',
    'нові історії',
    'пригоди',
  ],
  openGraph: {
    title: 'Архів Історій WanderCode',
    description:
      'Кожна подорож – це унікальна історія. Знайдіть свою наступну пригоду серед тисяч оповідань від нашої спільноти.',
    url: '/wandercode.jpg',
    siteName: 'WanderCode',
    type: 'website',
  },
};

export default async function StoriesPage() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['stories', undefined, 9],
      queryFn: ({ pageParam = 1 }) =>
        fetchAllStoriesServer({ page: pageParam, perPage: 9 }),
      getNextPageParam: (lastPage: StoriesPage) =>
        lastPage.data.hasNextPage ? lastPage.data.page + 1 : undefined,
      initialPageParam: 1,
    });
  } catch (err) {
    console.error('Server prefetch stories failed:', err);
    // залишаємо порожній QueryClient — клієнт компонент сам зробить запит
  }

  // Явно типізуємо categories як CategoryResponse та робимо fallback для безпечного рендеру
  let categories: CategoryResponse = { data: [] };

  try {
    const fetched = await fetchCategoriesServer();
    // Якщо fetchCategoriesServer повертає масив замість об'єкта, приведемо його до очікуваного shape
    if (Array.isArray(fetched)) {
      categories = { data: fetched };
    } else if (fetched && typeof fetched === 'object' && 'data' in fetched) {
      categories = fetched as CategoryResponse;
    } else {
      // fallback залишиться { data: [] }
      console.warn(
        'fetchCategoriesServer returned unexpected shape, using fallback categories'
      );
    }
  } catch (err) {
    console.error('Failed to fetch categories on server:', err);
    categories = { data: [] };
  }

  return (
    <Container>
      <section className={css.section}>
        <div className={css.headerContentWrap}>
          <h1 className={css.heading}>Історії Мандрівників</h1>
        </div>
        <StoriesClient
          dehydratedState={dehydrate(queryClient)}
          categories={categories}
        />
      </section>
    </Container>
  );
}
