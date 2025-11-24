// app/(public routes)/stories/[storyId]/page.tsx
import { notFound } from 'next/navigation';
import { fetchStoryByIdServer } from '@/lib/api/serverApi';

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { StoryDetailsClient } from './StoryDetailsClient';
import PopularSection from '@/components/PopularSection/PopularSection';
import styles from './page.module.css';
import Container from '@/components/Container/Container';

interface PageProps {
  params: Promise<{ id: string }>;
}

// export async function generateMetadata({
//   params,
// }: PageProps): Promise<Metadata> {
//   const { id } = await params;

//   if (!id) {
//     return {
//       title: 'Сторінка не знайдена | WanderCode',
//     };
//   }

//   let story: DetailedStory;
//   try {
//     story = await fetchStoryByIdServer(id);
//   } catch {
//     return {
//       title: 'Історія не знайдена | WanderCode',
//       description: 'Вибачте, запитана історія подорожі не знайдена.',
//     };
//   }

//   // ... (астатні код generateMetadata)
//   const fullTitle = `${story.title} | Історія від ${story.owner.name} | WanderCode`;
//   const canonicalUrl = `https://wander-code.vercel.app/stories/${id}`;

//   return {
//     title: fullTitle,
//     description: story.article,
//     alternates: {
//       canonical: canonicalUrl,
//     },
//     openGraph: {
//       title: fullTitle,
//       description: story.article,
//       url: canonicalUrl,
//       siteName: 'WanderCode',
//       type: 'article',
//       images: [
//         {
//           url: story.img,
//           width: 1200,
//           height: 630,
//           alt: story.title,
//         },
//       ],
//     },
//   };
// }

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const queryClient = new QueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: ['story', id],
      queryFn: () => fetchStoryByIdServer(id),
    });
  } catch {
    return notFound();
  }

  return (
    <Container>
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <StoryDetailsClient id={id} />
              <PopularSection />
            </HydrationBoundary>
          </div>
        </section>
      </main>
    </Container>
  );
}
