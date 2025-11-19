// app/(public routes)/travellers/[travellerId]/page.tsx

import React from 'react';
import { Metadata } from 'next';
import {
  getTravellerById,
  getTravellerInfoById,
} from '@/lib/api/travellersApi';
import { notFound } from 'next/navigation';
import css from './page.module.css';
import Container from '@/components/Container/Container';
import { TravellersInfo } from '@/components/TravellersInfo/TravellersInfo';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import TravellersStories from '@/components/TravellersStories/TravellersStories';
import { fetchAllStoriesServer } from '@/lib/api/serverApi';

type Props = {
  params: { travellerId: string };
};

// 🛑 ВЫПРАЎЛЕННЕ: Выкарыстоўваем 'any' для аргумента generateMetadata
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata(props: any): Promise<Metadata> {
  const { params } = props as Props; // Прывядзенне тыпу для бяспечнай працы
  const { travellerId } = params;

  // ⚠️ УВАГА: Апрацоўка notFound для generateMetadata: калі traveller.name будзе null/undefined,
  // тут можа быць памылка. Лепш зрабіць праверку.
  const traveller = await getTravellerInfoById(travellerId);
  if (!traveller) {
    // Вяртаем агульныя метададзеныя або кідаем памылку
    return { title: `Мандрівник не знайдений` };
  }

  return {
    title: `Профіль Мандрівника: ${traveller.name}`,
    description: `Історії подорожей, фото та пригоди з усього світу.`,
    openGraph: {
      title: `Профіль Мандрівника: ${traveller.name}`,
      description: '',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/travelers/${travellerId}`,
      siteName: 'Подорожники',
      images: [
        {
          url: traveller.avatarUrl,
          width: 1200,
          height: 630,
          alt: `Профіль мандрівника ${traveller.name}`,
        },
      ],
    },
  };
}

// 🛑 ВЫПРАЎЛЕННЕ: Выкарыстоўваем 'any' для аргумента кампанента старонкі
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function TravellerProfilePage(props: any) {
  const { params } = props as Props; // Прывядзенне тыпу для бяспечнай працы

  // ❌ Выдаляем: const resolvedParams = params; (прыбрана, бо яна лішняя)
  const travellerId = params.travellerId?.trim();

  if (!travellerId) {
    return notFound();
  }

  const filter = travellerId;
  const traveller = await getTravellerById(travellerId);
  if (!traveller) {
    return notFound();
  }

  const stories = await fetchAllStoriesServer({ filter });
  const safeStories =
    stories && stories.data
      ? stories
      : {
          data: {
            data: [],

            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            page: 1,
            perPage: 9,
            hasPreviousPage: false,
          },
        };
  const isStories = safeStories.data.totalItems > 0;

  return (
    <Container>
      <div className={css.profile}>
        <TravellersInfo traveller={traveller} />
        <h2 className={css.title}>Історії Мандрівника</h2>
        {isStories ? (
          <TravellersStories initialStories={safeStories} filter={filter} />
        ) : (
          <MessageNoStories
            text={'Цей користувач ще не публікував історій'}
            buttonText={'Назад до історій'}
          />
        )}
      </div>
    </Container>
  );
}
