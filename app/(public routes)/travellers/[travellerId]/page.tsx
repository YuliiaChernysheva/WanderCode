import React from 'react';
import { getTravellerById, Traveller } from '@/lib/api/travellersApi';
import { notFound } from 'next/navigation';
import Container from '@/components/Container/Container';
import TravellerInfo from '@/components/Travellers/TravellerInfo/TravellerInfo';
import TravellerProfileStories from '@/components/Travellers/TravellerProfileStories/TravellerProfileStories';
import { isAxiosError } from 'axios';
export const dynamic = 'force-dynamic';

// Use unknown for props and await params to satisfy Next.js runtime requirement
export default async function TravellerProfilePage(props: unknown) {
  // Await params — works whether params is a Promise or a plain object
  const params = await (props as { params?: { travellerId?: string } })?.params;
  const travellerId = params?.travellerId;

  if (!travellerId) {
    return notFound();
  }

  let traveller: Traveller | null = null;
  try {
    traveller = await getTravellerById(travellerId);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return notFound();
    }
    // Log and rethrow so that Next.js can surface the error (or you can render an error UI)
    console.error(`Помилка завантаження профілю ${travellerId}:`, error);
    throw error;
  }

  if (!traveller) {
    return notFound();
  }

  return (
    <Container>
      <div style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <TravellerInfo traveller={traveller} />
        <TravellerProfileStories
          travellerId={traveller._id}
          travellerName={traveller.name}
        />
      </div>
    </Container>
  );
}
