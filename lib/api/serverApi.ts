// lib/api/serverApi.ts

import { cookies } from 'next/headers';
import { api } from './api';
import { Category, DetailedStory, StoriesResponse, Story } from '@/types/story';
import { User } from '@/types/user';
import { AxiosError, AxiosResponse } from 'axios';

async function getServerCookies(): Promise<string> {
  const cookieStore = await cookies();

  const cookieString = cookieStore
    .getAll()
    .map(
      (cookie: { name: string; value: string }) =>
        `${cookie.name}=${cookie.value}`
    )
    .join('; ');

  return cookieString;
}

export const checkServerSession = async (): Promise<AxiosResponse> => {
  const res = await api.get('/auth/refresh', {
    headers: {
      Cookie: await getServerCookies(),
    },
  });

  return res;
};

async function executeStoriesRequest({
  page,
  perPage,
  filter,
  sortField,
  sortOrder,
}: {
  page?: number;
  perPage?: number;
  filter?: string;
  sortField?: string;
  sortOrder?: string;
}): Promise<StoriesResponse> {
  const response = await api.get<StoriesResponse>(`/stories`, {
    params: {
      page,
      perPage,
      filter,
      sortField,
      sortOrder,
    },
    headers: {
      Cookie: await getServerCookies(),
    },
  });

  return response.data;
}

export async function fetchAllStoriesServer({
  page,
  perPage,
  filter,
  sortField,
  sortOrder,
}: {
  page?: number;
  perPage?: number;
  filter?: string;
  sortField?: string;
  sortOrder?: string;
}): Promise<StoriesResponse> {
  const requestedPerPage = perPage || 4;
  const backendPerPage = 3;

  try {
    // 1. Query 1st page
    const response1 = await executeStoriesRequest({
      page: 1,
      perPage: backendPerPage,
      filter,
      sortField,
      sortOrder,
    }); // 2. Query 2nd page

    const response2 = await executeStoriesRequest({
      page: 2,
      perPage: backendPerPage,
      filter,
      sortField,
      sortOrder,
    });

    let storiesData: Story[] = [];

    const data1 = response1?.data?.data || [];
    const data2 = response2?.data?.data || []; // Concatenate and slice to the requested amount (4)

    storiesData = [...data1, ...data2];
    storiesData = storiesData.slice(0, requestedPerPage);

    const totalReturned = storiesData.length;

    const correctedResponse: StoriesResponse = {
      data: {
        totalItems: response1.data.totalItems || totalReturned,
        totalPages: response1.data.totalPages || 1,
        hasNextPage: response1.data.hasNextPage || false,
        hasPreviousPage: response1.data.hasPreviousPage || false,

        currentPage: page || 1, // Corrected values for the frontend

        data: storiesData as Story[],
        page: page || 1,
        perPage: requestedPerPage,
      },
    };

    return correctedResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    return {
      data: {
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page || 1,
        page: page || 1,
        perPage: requestedPerPage,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

export const getMeServer = async (): Promise<User | null> => {
  try {
    const res = await api.get<User>('/users/current', {
      headers: {
        Cookie: await getServerCookies(),
      },
    });

    return res.data;
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return null;
      }
      console.error('Failed to fetch user on server:', err.message);
      return null;
    }
    console.error('Unexpected error on server:', err);
    return null;
  }
};

export interface CategoryResponse {
  status: number;
  message: string;
  data: Category[];
}
export async function fetchCategoriesServer(): Promise<CategoryResponse> {
  const response = await api.get<CategoryResponse>(`/stories/categories`);

  return {
    ...response.data,
  };
}

export async function fetchStoryByIdServer(
  storyId: string
): Promise<DetailedStory> {
  try {
    if (!storyId) {
      throw new Error('storyId не передано');
    }

    const res = await api.get(`/stories/${storyId}`);
    const storyData = res.data?.data;

    if (!storyData) {
      throw new Error('Story Not Found (дані пусті)');
    }

    const story: DetailedStory = {
      _id: storyData._id,
      img: storyData.img || '/file.svg',
      title: storyData.title || 'Без назви',
      article: storyData.article || '',
      category: {
        _id: storyData.category?._id || '',
        title: storyData.category?.title || '–',
      },
      owner: {
        _id: storyData.owner?._id || '',
        name: storyData.owner?.name || '–',
        avatarUrl: storyData.owner?.avatarUrl || '/file.svg',
      },
      date: storyData.date || new Date().toISOString(),
      favoriteCount: storyData.favoriteCount || 0,
    };

    return story;
  } catch (error) {
    console.error('Помилка fetchStoryByIdServer:', error);

    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new Error('Story Not Found (404)');
    }

    throw new Error('Не вдалося завантажыць історыю (SSR)');
  }
}
