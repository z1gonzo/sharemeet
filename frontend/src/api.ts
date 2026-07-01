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

export interface ApiComment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: ApiPostAuthor;
}

export interface ApiPublicProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
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

interface CreateCommentPayload {
  content: string;
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

export async function getMyPosts(accessToken: string) {
  return apiRequest<ApiPost[]>('/posts/me?limit=20&offset=0', {
    headers: authHeaders(accessToken),
  });
}

export async function getFollowingPosts(accessToken: string) {
  return apiRequest<ApiPost[]>('/posts/following?limit=20&offset=0', {
    headers: authHeaders(accessToken),
  });
}

export async function createPost(payload: CreatePostPayload, accessToken: string) {
  return apiRequest<ApiPost>('/posts', {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: 'POST',
  });
}

export async function getPostComments(postId: string) {
  return apiRequest<ApiComment[]>(`/posts/${postId}/comments?limit=20&offset=0`);
}

export async function getUserPosts(username: string) {
  return apiRequest<ApiPost[]>(`/users/${username}/posts?limit=3&offset=0`);
}

export async function getUserProfile(username: string, accessToken?: string | null) {
  return apiRequest<ApiPublicProfile>(`/users/${username}`, {
    ...(accessToken ? { headers: authHeaders(accessToken) } : {}),
  });
}

export async function followUser(username: string, accessToken: string) {
  return apiRequest<ApiPublicProfile>(`/users/${username}/follow`, {
    headers: authHeaders(accessToken),
    method: 'POST',
  });
}

export async function unfollowUser(username: string, accessToken: string) {
  return apiRequest<void>(`/users/${username}/follow`, {
    headers: authHeaders(accessToken),
    method: 'DELETE',
  });
}

export async function createComment(postId: string, payload: CreateCommentPayload, accessToken: string) {
  return apiRequest<ApiComment>(`/posts/${postId}/comments`, {
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

  if (response.status === 204) {
    return undefined as T;
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
