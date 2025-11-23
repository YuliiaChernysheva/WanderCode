// components/StoriesListWrapper.tsx
'use client';

import StoriesList, {
  StoryWithStatus,
} from '@/components/StoriesList/StoriesList';
// import { useState } from 'react';

interface Props {
  initialStories: StoryWithStatus[];
}

export default function StoriesListWrapper({ initialStories }: Props) {
  // const [stories, setStories] = useState(initialStories);

  return <StoriesList stories={initialStories} />;
}
