import { Metadata } from 'next';
import Image from 'next/image';

import { getTravellerById } from '@/lib/api/travellersApi';

type Props = {
  params: Promise<{ travellerId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { travellerId } = await params;
  const traveller = await getTravellerById(travellerId);
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

const TravellerInfo = async ({ params }: Props) => {
  const { travellerId } = await params;
  const traveller = await getTravellerById(travellerId);

  return (
    <div>
      <h2>TravellerInfo</h2>
      <Image
        src={traveller.avatarUrl}
        alt={`Photo ${traveller.name}`}
        width={300}
        height={300}
      />
      <h3>{traveller.name}</h3>
      <p>{traveller.description}</p>
    </div>
  );
};

export default TravellerInfo;
