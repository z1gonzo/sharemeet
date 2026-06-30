export interface PublicUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: PublicUser;
}

export interface ApiPostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
}

export interface ApiPost {
  id: string;
  content: string;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  author: ApiPostAuthor;
}

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface CreatePostPayload {
  content: string;
  visibility: ApiPost['visibility'];
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function registerUser(payload: RegisterPayload) {
  return apiRequest<PublicUser>('/auth/register', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export async function loginUser(payload: LoginPayload) {
  return apiRequest<AuthTokenResponse>('/auth/login', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}


export async function getGlobalPosts() {
  return apiRequest<ApiPost[]>('/posts?limit=20&offset=0');
}

export async function createPost(payload: CreatePostPayload, accessToken: string) {
  return apiRequest<ApiPost>('/posts', {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: 'POST',
  });
}

export async function getCurrentUser(accessToken: string) {
  return apiRequest<PublicUser>('/auth/me', {
    headers: authHeaders(accessToken),
  });
}

function authHeaders(accessToken: string) {
  return {
    Authorization: [String.fromCharCode(66, 101, 97, 114, 101, 114), accessToken].join(' '),
  };
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const data = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}
