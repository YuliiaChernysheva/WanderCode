// components/TravellersStoriesItem/TravellersStoriesItem.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Story } from '@/types/story';
import {
  toggleStoryBookmark,
  fetchUserById,
  fetchAllCategories,
} from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { showErrorToast } from '@/components/ShowErrorToast/ShowErrorToast';
import styles from './TravellersStoriesItem.module.css';
import { User } from '@/types/user';
import { log } from 'console';

// 🛑 ВЫЗНАЧЭННЕ ТЫПАЎ, ЯКІЯ БУДУЦЬ ВЫКАРЫСТАНЫЯ
export type ProfileProps = {
  avatarUrl?: string; // string | undefined
  name?: string; // string | undefined
  description?: string;
};

interface Category {
  _id: string;
  name: string;
}

interface StoryWithStatus extends Story {
  isFavorite: boolean;
}

type TravellersStoriesItemProps = {
  story: StoryWithStatus;
  onToggleSuccess: (storyId: string, isAdding: boolean) => void;
};

interface MutationContext {
  currentSaved: boolean;
}

// 🛑 УНУТРАНАЯ ФУНКЦЫЯ: Тыпізаваная праз ProfileProps
const AuthorDisplay = ({ name, avatarUrl }: ProfileProps) => (
  <>
    <Image
      // Выкарыстоўваем дэфолт, калі avatarUrl не перададзены
      src={avatarUrl || '/default-avatar.png'}
      alt={name || 'avatar'}
      width={40}
      height={40}
      className={styles.authorAvatar}
    />
    <div className={styles.authorInfoWrapper}>
      {/* Паказваем імя або "Невядомы аўтар" */}
      <span className={styles.authorName}>{name || 'Невядомы аўтар'}</span>
    </div>
  </>
);

const TravellersStoriesItem = ({
  story,
  onToggleSuccess,
}: TravellersStoriesItemProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const storyId = story._id;
  const imageUrl = story.img;
  const categoryId = story.category;
  const title = story.title;
  const description = story.article;
  const publishedAt = story.date;
  const initialBookmarksCount = story.favoriteCount ?? 0;
  const initiallySaved = story.isFavorite;
  const authorId = story.ownerId._id;

  const {
    data: authorData,
    isLoading: isAuthorLoading,
    isError: isAuthorError,
    error: authorError,
  } = useQuery<User>({
    queryKey: ['user', authorId],
    queryFn: () => fetchUserById(authorId),
    enabled: !!authorId,
    staleTime: Infinity,
  });

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchAllCategories,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const finalAuthorName = isAuthorLoading
    ? 'Загрузка автора...'
    : isAuthorError
      ? 'Помилка автора'
      : authorData?.name;

  const finalAuthorAvatar = authorData?.avatarUrl;

  const categoryName = useMemo(() => {
    if (!categoriesData) return '–';
    const categoryObj = categoriesData.find(
      (cat) => cat._id === categoryId._id
    );

    return categoryObj?.name;
  }, [categoriesData, categoryId]);

  const [saved, setSaved] = useState<boolean>(initiallySaved);
  const [bookmarks, setBookmarks] = useState<number>(initialBookmarksCount);

  // ФАРМАТАВАННЕ ДАТЫ
  const dateStr = useMemo(() => {
    const d = new Date(publishedAt);
    return d.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }, [publishedAt]);

  useEffect(() => {
    if (isAuthorError) {
      console.error('Error fetching author data:', authorError);
    }
  }, [isAuthorError, authorError]);

  const { mutate: handleToggleBookmark, isPending } = useMutation<
    unknown,
    unknown,
    boolean,
    MutationContext
  >({
    mutationFn: (currentSavedState: boolean) =>
      toggleStoryBookmark(storyId, currentSavedState),
    onMutate: async () => {
      const currentSaved = saved;
      setSaved((prev) => !prev);
      setBookmarks((prev) => (currentSaved ? Math.max(0, prev - 1) : prev + 1));
      return { currentSaved };
    },
    onError: (error: unknown, variables, context) => {
      showErrorToast(
        error instanceof Error
          ? error.message
          : 'Сталася помилка. Спробуйте ще раз.'
      );
      const operationWasDelete = context?.currentSaved;

      setSaved((prev) => !prev);
      setBookmarks((prev) =>
        operationWasDelete ? prev + 1 : Math.max(0, prev - 1)
      );
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story', storyId] });
      const wasSavedBefore = context?.currentSaved;
      onToggleSuccess(storyId, !wasSavedBefore);
    },
  });

  const onBookmarkClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    handleToggleBookmark(saved);
  };

  return (
    <article className={styles.card}>
      <Link href={`/stories/${storyId}`} className={styles.imageLink}>
        <Image
          src={imageUrl}
          alt={title}
          width={800}
          height={320}
          className={styles.image}
        />
      </Link>
      <div className={styles.content}>
        <span className={styles.categoryBadge}>{categoryName}</span>
        <header>
          <Link href={`/stories/${storyId}`}>
            <h3 className={styles.title}>{title}</h3>
          </Link>
        </header>
        <p className={styles.description}>{description}</p>

        <div className={styles.authorMetaBlock}>
          {/* 🛑 ВЫКАРЫСТАННЕ AUTHOR DISPLAY */}
          <AuthorDisplay name={finalAuthorName} avatarUrl={finalAuthorAvatar} />

          <div className={styles.dateAndBookmarks}>
            <span className={styles.publishedDate}>{dateStr}</span>

            <span className={styles.bookmarks}>
              <span className={styles.bookmarksCount}>{bookmarks}</span>

              {saved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href={`/stories/${storyId}`} className={styles.viewButton}>
            Переглянути статтю
          </Link>

          <button
            type="button"
            onClick={onBookmarkClick}
            disabled={isPending}
            aria-pressed={saved}
            aria-label={
              saved ? 'Видалити історію із збережених' : 'Зберегти історію'
            }
            className={[
              styles.bookmarkButton,
              saved ? styles.bookmarkButtonSaved : '',
              isPending ? styles.bookmarkButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Збереження...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {saved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {saved ? 'Збережено' : ''}
              </span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default TravellersStoriesItem;
