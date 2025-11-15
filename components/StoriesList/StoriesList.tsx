// components/StoriesList/StoriesList.tsx
import React from 'react';
import { Story } from '@/types/story';

interface StoriesListProps {
  stories: Story[];
}

const StoriesList: React.FC<StoriesListProps> = ({ stories }) => {
  if (!stories || stories.length === 0) {
    return null;
  }
  return (
    <div className="stories-list-grid">
      {/* ... rendering logic ... */}
      {stories.map((story) => (
        <div key={story._id}>
          <h3>{story.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default StoriesList;
