// app/(public routes)/travelers/[travellerId]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import {
  getTravellerById,
  getTravellerInfoById,
} from '@/lib/api/travellersApi';
import TravellerInfo from '@/components/TravellerInfo/TravellerInfo';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ travellerId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { travellerId } = await params;
  const traveller = await getTravellerInfoById(travellerId);
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

interface TravellerPageProps {
  params: Promise<{ travellerId: string }>;
}

export default async function TravellerProfilePage({
  params,
}: TravellerPageProps) {
  const { travellerId } = await params;

  if (!travellerId) {
    notFound();
  }
  
  const travellerInfo = await getTravellerInfoById(travellerId);
  const traveller = await getTravellerById(travellerId);

  if (!traveller) {
    notFound();
  }

  return (
    <>
      <TravellerInfo traveller={travellerInfo} />
    </>
  );
}
