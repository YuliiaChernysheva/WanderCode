// lib/api/travellersApi.ts
import { nextServer } from './api';

export type Traveller = {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
  raw?: unknown;
};

export type FetchTravellersParams = {
  perPage: number;
  page: number;
};

export type FetchTravellersResponse = {
  data: Traveller[];
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  perPage: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringFromKeys(
  obj: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim().length > 0) {
      return v;
    }
  }
  return undefined;
}

function normalizeRaw(raw: unknown, fallbackIndex: number): Traveller {
  let id = `generated-${Date.now()}-${fallbackIndex}`;
  let name = '';
  let avatarUrl: string | undefined = undefined;
  let description: string | undefined = undefined;

  if (isObject(raw)) {
    // id: support {_id: {$oid: string}} or {_id: string} or id
    const _id = raw['_id'];
    if (isObject(_id)) {
      const oid = _id['$oid'];
      if (typeof oid === 'string' && oid.length > 0) id = oid;
    } else if (typeof _id === 'string' && _id.length > 0) {
      id = _id;
    } else if (typeof raw['id'] === 'string' && raw['id'].length > 0) {
      id = raw['id'];
    }

    name =
      getStringFromKeys(raw, ['name', 'title', 'fullName']) ??
      getStringFromKeys(raw, ['username', 'label']) ??
      '';

    avatarUrl = getStringFromKeys(raw, ['avatar', 'avatarUrl', 'img', 'image']);

    description = getStringFromKeys(raw, [
      'description',
      'article',
      'bio',
      'about',
    ]);
  }

  return {
    id,
    name,
    avatarUrl,
    description,
    raw,
  };
}

/* Fetch travellers from backend using page+perPage pagination */
export async function fetchTravellers(
  params: FetchTravellersParams
): Promise<FetchTravellersResponse> {
  try {
    const res = await nextServer.get('/users', {
      params: {
        perPage: params.perPage,
        page: params.page,
      },
    });

    const payload: unknown = res.data;
    let items: unknown[] = [];
    if (isObject(payload) && Array.isArray(payload.data)) {
      items = payload.data;
      const totalItems =
        typeof payload.totalItems === 'number' ? payload.totalItems : 0;
      const totalPages =
        typeof payload.totalPages === 'number' ? payload.totalPages : 1;
      const hasNextPage =
        typeof payload.hasNextPage === 'boolean' ? payload.hasNextPage : false;
      const hasPreviousPage =
        typeof payload.hasPreviousPage === 'boolean'
          ? payload.hasPreviousPage
          : false;
      const currentPage =
        typeof payload.page === 'number' ? payload.page : params.page;
      const currentPerPage =
        typeof payload.perPage === 'number' ? payload.perPage : params.perPage;

      const normalized = items.map((it, idx) => normalizeRaw(it, idx));

      return {
        data: normalized,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        page: currentPage,
        perPage: currentPerPage,
      };
    }

    return {
      data: [],
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      page: params.page,
      perPage: params.perPage,
    };
  } catch (error) {
    throw error;
  }
}
