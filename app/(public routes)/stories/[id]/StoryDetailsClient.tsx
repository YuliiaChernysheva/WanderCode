'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addStoryToSaved,
  fetchStoryById,
  removeStoryFromSaved,
} from '@/lib/api/clientApi';
import css from './StoryDetailsClient.client.module.css';
import { DetailedStory } from '@/types/story';
import Loader from '@/components/Loader/Loader';

import MessageNoStories from '@/components/MessageNoStories/MessageNoStories';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { showErrorToast } from '@/components/ShowErrorToast/ShowErrorToast';

interface PageParams {
  id: string;
}

export function StoryDetailsClient({ id }: PageParams) {
  const queryClient = useQueryClient();
  const [imgSrc, setImgSrc] = useState<string>('/default-avatar.png');
  const { isAuthenticated, user } = useAuthStore();

  const [saved, setSaved] = useState(false);
  // перевірка користувача
  useEffect(() => {
    if (isAuthenticated && user) {
      setSaved(user.selectedStories?.includes(id) ?? false);
    }
  }, [isAuthenticated, user, id]);

  const router = useRouter();

  const goToRegister = () => {
    router.push('/auth/login');
  };

  const {
    data: story,
    isLoading,
    isError,
  } = useQuery<DetailedStory, Error>({
    queryKey: ['story', id],
    queryFn: () => fetchStoryById(id),

    initialData: () => queryClient.getQueryData<DetailedStory>(['story', id]),
    enabled: !!id,
  });

  useEffect(() => {
    if (story?.img) setImgSrc(story.img);
  }, [story]);

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ id, isSaved }: { id: string; isSaved: boolean }) => {
      if (isSaved) {
        return await removeStoryFromSaved(id);
      } else {
        return await addStoryToSaved(id);
      }
    },
    onSuccess: () => {
      setSaved((prev) => !prev);
    },
    onError: () => {
      showErrorToast('Щось пішло не так');
    },
  });

  if (isLoading) return <Loader />;

  if (isError || !story) {
    return (
      <MessageNoStories
        text="Історію не знайдено"
        buttonText="Повернутися до всіх історій"
      />
    );
  }

  return (
    <>
      <h2 className={css.title}>{story.title}</h2>

      <div className={css.infoBlock}>
        <div className={css.leftBlock}>
          <p className={css.data}>
            <span className={css.label}>Автор статті:</span>
            <span className={css.value}>{story.ownerId?.name || ' - '}</span>
          </p>
          <p className={css.data}>
            <span className={css.label}>Опубліковано:</span>
            <span className={css.value}>
              {story.date ? new Date(story.date).toLocaleDateString() : '–'}
            </span>
          </p>
        </div>
        <p className={css.country}>
          <span className={css.value}>{story.category?.name}</span>
        </p>
      </div>

      <div
        className={css.imageWrapper}
        style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}
      >
        <Image
          src={imgSrc}
          alt={story.title || 'default'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          onError={() => setImgSrc('/file.svg')}
          unoptimized
        />
      </div>

      <div className={css.articleBlock}>
        <p className={css.article}>{story.article}</p>

        {!saved && (
          <div className={css.savedBlock}>
            <h3 className={css.savedTitle}>Збережіть собі історію</h3>
            <p className={css.savedText}>
              Вона буде доступна у вашому профілі у розділі збережене
            </p>
            <button
              className={css.saveButton}
              onClick={() => {
                if (!isAuthenticated) {
                  goToRegister();
                } else {
                  toggleSaveMutation.mutate({
                    id: story._id,
                    isSaved: saved,
                  });
                }
              }}
            >
              {saved ? 'Збережено' : 'Зберегти'}
            </button>
          </div>
        )}
      </div>
      <p className={css.stories}>Популярні історії</p>
    </>
  );
}
