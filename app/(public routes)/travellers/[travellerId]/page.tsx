import React from 'react';
import { getTravellerById } from '@/lib/api/travellersApi';
import { notFound } from 'next/navigation';
import css from './page.module.css';
import Container from '@/components/Container/Container';
import { TravellersInfo } from '@/components/TravellersInfo/TravellersInfo';
import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
// import TravellersStories from '@/components/TravellersStories/TravellersStories';
import { fetchAllStoriesServer } from '@/lib/api/serverApi';

// Use unknown for props and await params to satisfy Next.js runtime requirement
export default async function TravellerProfilePage(props: unknown) {
  // Await params — works whether params is a Promise or a plain object
  const params = await (props as { params?: { travellerId?: string } })?.params;
  const travellerId = params?.travellerId;

  if (!travellerId) {
    return notFound();
  }

  const filter = travellerId;
  const traveller = await getTravellerById(travellerId);
  const stories = await fetchAllStoriesServer({ filter });
  const isStories = stories && stories.data && stories.data.totalItems > 0;
  console.log('stories', stories);

  if (!traveller) {
    return notFound();
  }

  return (
    <Container>
      <div className={css.profile}>
        <TravellersInfo traveller={traveller} />
        <h2 className={css.title}>Історії Мандрівника</h2>
        {isStories ? (
          <div>Є історії</div> // замінити на TravellersStories
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
