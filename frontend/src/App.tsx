import { useEffect, useMemo, useState } from 'react';
import { ApiError, createComment, createPost, deleteComment, deletePost, followUser, getCurrentUser, getFollowingPosts, getGlobalPosts, getMyPosts, getPostComments, getUserPosts, getUserProfile, loginUser, registerUser, unfollowUser, updateComment, updatePost } from './api';
import type { ApiComment, ApiPost, ApiPublicProfile, AuthTokenResponse, PublicUser } from './api';

type Visibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

type FeedTab = 'Global' | 'Following' | 'My posts';
type AuthMode = 'login' | 'register';
type FeedStatus = 'idle' | 'loading' | 'ready' | 'error';

interface Author {
  initials: string;
  name: string;
  username: string;
  role: string;
  accent: 'indigo' | 'emerald' | 'warm';
}

type CommentItem = {
  id: string;
  author: {
    name: string;
    username: string;
    initials: string;
  };
  text: string;
};

interface Post {
  id: string;
  author: Author;
  content: string;
  visibility: Visibility;
  createdAt: string;
  commentsCount: number;
  comments: CommentItem[];
}

const initialPosts: Post[] = [
  {
    id: 'post-1',
    author: {
      initials: 'A',
      name: 'Anna Nowak',
      username: 'anna',
      role: 'Product designer',
      accent: 'indigo',
    },
    content:
      'ShareMeet zaczyna wyglądać jak prawdziwy social-tech produkt. Najważniejsze, że UI pokazuje visibility, komentarze i stan follow bez zamiany feedu w dashboard.',
    visibility: 'PUBLIC',
    createdAt: '12 min',
    commentsCount: 4,
    comments: [
      {
        id: 'c1',
        author: { name: 'Łukasz', username: 'lukasz', initials: 'Ł' },
        text: 'Dokładnie — backendowe ficzery mają być widoczne, ale nie krzyczeć.',
      },
      {
        id: 'c2',
        author: { name: 'Marta', username: 'marta', initials: 'M' },
        text: 'Ten kierunek wygląda bardziej portfolio-ready niż klasyczny jasny feed.',
      },
    ],
  },
  {
    id: 'post-2',
    author: {
      initials: 'K',
      name: 'Kamil Zieliński',
      username: 'kamil',
      role: 'Backend engineer',
      accent: 'emerald',
    },
    content:
      'Visibility FOLLOWERS dobrze pokazuje, że ShareMeet ma już przemyślany model prywatności, a nie tylko publiczny CRUD postów.',
    visibility: 'FOLLOWERS',
    createdAt: '1 h',
    commentsCount: 2,
    comments: [
      {
        id: 'c3',
        author: { name: 'Anna', username: 'anna', initials: 'A' },
        text: 'To będzie fajny element do pokazania rekruterowi w demo.',
      },
    ],
  },
  {
    id: 'post-3',
    author: {
      initials: 'M',
      name: 'Maria Kowalska',
      username: 'maria',
      role: 'Community lead',
      accent: 'warm',
    },
    content:
      'Ciemny styl jest elegancki, ale zostawmy trochę ludzkiego tonu: krótkie bio, social stats, komentarze i prosty Follow button.',
    visibility: 'PUBLIC',
    createdAt: '3 h',
    commentsCount: 6,
    comments: [
      {
        id: 'c4',
        author: { name: 'Łukasz', username: 'lukasz', initials: 'Ł' },
        text: 'Tak, to jest ten kompromis: premium, ale nadal społecznościowe.',
      },
    ],
  },
];

const mockCurrentUser = {
  name: 'Łukasz',
  username: 'z1gonzo',
  initials: 'Ł',
  bio: 'Building ShareMeet — NestJS, Prisma, PostgreSQL and now a dark social-tech frontend.',
  followersCount: 128,
  followingCount: 86,
};

export function App() {
  const [activeTab, setActiveTab] = useState<FeedTab>('Global');
  const [composerValue, setComposerValue] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [posts, setPosts] = useState(initialPosts);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [composerStatus, setComposerStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle');
  const [composerMessage, setComposerMessage] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('idle');
  const [feedError, setFeedError] = useState<string | null>(null);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [followingStatus, setFollowingStatus] = useState<FeedStatus>('idle');
  const [followingError, setFollowingError] = useState<string | null>(null);
  const [myPostsStatus, setMyPostsStatus] = useState<FeedStatus>('idle');
  const [myPostsError, setMyPostsError] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>('post-1');
  const [profile, setProfile] = useState<ApiPublicProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<FeedStatus>('idle');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profilePosts, setProfilePosts] = useState<ApiPost[]>([]);
  const [profilePostsStatus, setProfilePostsStatus] = useState<FeedStatus>('idle');
  const [profilePostsError, setProfilePostsError] = useState<string | null>(null);
  const [followActionStatus, setFollowActionStatus] = useState<'idle' | 'loading'>('idle');
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authEmail, setAuthEmail] = useState('lukasz@example.com');
  const [authUsername, setAuthUsername] = useState('z1gonzo');
  const [authPassword, setAuthPassword] = useState('sharemeet-demo');
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('sharemeet.accessToken'));
  const [authenticatedUser, setAuthenticatedUser] = useState<PublicUser | null>(null);
  const [authIsSubmitting, setAuthIsSubmitting] = useState(false);

  const activeUser = authenticatedUser
    ? {
        initials: getInitials(authenticatedUser),
        name: authenticatedUser.displayName ?? authenticatedUser.username,
        username: authenticatedUser.username,
      }
    : mockCurrentUser;

  useEffect(() => {
    if (!accessToken) {
      setAuthenticatedUser(null);
      return;
    }

    let cancelled = false;

    getCurrentUser(accessToken)
      .then((user) => {
        if (!cancelled) {
          setAuthenticatedUser(user);
          setAuthStatus(`Session restored for @${user.username}.`);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          localStorage.removeItem('sharemeet.accessToken');
          setAccessToken(null);
          setAuthenticatedUser(null);
          setAuthStatus(getErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    void loadGlobalFeed();
  }, []);

  useEffect(() => {
    void loadProfile(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const status = activeTab;

    if (status === 'Following') {
      if (!accessToken || !authenticatedUser) {
        setFollowingPosts([]);
        setFollowingStatus('idle');
        setFollowingError(null);
        return;
      }

      let cancelled = false;

      setFollowingStatus('loading');
      setFollowingError(null);
      getFollowingPosts(accessToken)
        .then((apiPosts) => {
          if (!cancelled) {
            setFollowingPosts(apiPosts.map(mapApiPost));
            setFollowingStatus('ready');
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setFollowingStatus('error');
            setFollowingError(getErrorMessage(error));
          }
        });

      return () => {
        cancelled = true;
      };
    }
  }, [activeTab, accessToken, authenticatedUser]);

  useEffect(() => {
    if (activeTab !== 'My posts') {
      return;
    }

    if (!accessToken || !authenticatedUser) {
      setMyPosts([]);
      setMyPostsStatus('error');
      setMyPostsError('Sign in to view your posts.');
      return;
    }

    void loadMyPosts();
  }, [accessToken, activeTab, authenticatedUser?.id]);

  async function loadGlobalFeed() {
    setFeedStatus('loading');
    setFeedError(null);

    try {
      const apiPosts = await getGlobalPosts();
      setPosts(apiPosts.map(mapApiPost));
      setOpenComments(null);
      setFeedStatus('ready');
    } catch (error) {
      setFeedError(getErrorMessage(error));
      setFeedStatus('error');
    }
  }

  async function loadMyPosts() {
    if (!accessToken) {
      setMyPosts([]);
      setMyPostsStatus('error');
      setMyPostsError('Sign in to view your posts.');
      openAuth('login');
      return;
    }

    setMyPostsStatus('loading');
    setMyPostsError(null);

    try {
      const apiPosts = await getMyPosts(accessToken);
      setMyPosts(apiPosts.map(mapApiPost));
      setOpenComments(null);
      setMyPostsStatus('ready');
    } catch (error) {
      setMyPostsError(getErrorMessage(error));
      setMyPostsStatus('error');
    }
  }

  async function loadProfile(token: string | null = accessToken) {
    setProfileStatus('loading');
    setProfileError(null);
    setProfilePostsStatus('loading');
    setProfilePostsError(null);

    try {
      const [profileData, postsData] = await Promise.all([
        getUserProfile('maria', token),
        getUserPosts('maria'),
      ]);
      setProfile(profileData);
      setProfilePosts(postsData);
      setProfileStatus('ready');
      setProfilePostsStatus('ready');
    } catch (error) {
      setProfileError(getErrorMessage(error));
      setProfileStatus('error');
      setProfilePostsStatus('error');
      setProfilePostsError(getErrorMessage(error));
    }
  }

  function refreshActiveFeed() {
    if (activeTab === 'My posts') {
      void loadMyPosts();
      return;
    }

    void loadGlobalFeed();
  }

  const filteredPosts = useMemo(() => {
    if (activeTab === 'Following') {
      return followingPosts;
    }

    if (activeTab === 'My posts') {
      return myPosts;
    }

    return posts.filter((post) => post.visibility === 'PUBLIC');
  }, [activeTab, followingPosts, myPosts, posts]);

  async function publishPost() {
    const trimmed = composerValue.trim();

    if (!trimmed) {
      setComposerStatus('error');
      setComposerMessage('Write something before publishing.');
      return;
    }

    if (!accessToken || !authenticatedUser) {
      setComposerStatus('error');
      setComposerMessage('Sign in before publishing a post.');
      openAuth('login');
      return;
    }

    setComposerStatus('publishing');
    setComposerMessage(null);

    try {
      const createdPost = await createPost({ content: trimmed, visibility }, accessToken);
      const mappedPost = mapApiPost(createdPost);
      setComposerValue('');
      setPosts((previousPosts) => [mappedPost, ...previousPosts.filter((post) => post.id !== createdPost.id)]);
      setMyPosts((previousPosts) => [mappedPost, ...previousPosts.filter((post) => post.id !== createdPost.id)]);
      setOpenComments(null);
      setActiveTab(createdPost.visibility === 'PUBLIC' ? 'Global' : 'My posts');
      setComposerStatus('published');
      setComposerMessage(
        createdPost.visibility === 'PUBLIC'
          ? 'Post published and added to the live feed.'
          : 'Post published and added to My posts.',
      );

      if (createdPost.visibility === 'PUBLIC') {
        await loadGlobalFeed();
      } else {
        await loadMyPosts();
      }
    } catch (error) {
      setComposerStatus('error');
      setComposerMessage(getErrorMessage(error));
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthStatus(null);
  }

  async function submitAuth() {
    setAuthIsSubmitting(true);
    setAuthStatus(null);

    try {
      let response: AuthTokenResponse;

      if (authMode === 'register') {
        await registerUser({
          displayName: authUsername,
          email: authEmail,
          password: authPassword,
          username: authUsername,
        });
        response = await loginUser({ email: authEmail, password: authPassword });
      } else {
        response = await loginUser({ email: authEmail, password: authPassword });
      }

      localStorage.setItem('sharemeet.accessToken', response.accessToken);
      setAccessToken(response.accessToken);
      setAuthenticatedUser(response.user);
      setAuthStatus(`${authMode === 'register' ? 'Registered and signed in' : 'Signed in'} as @${response.user.username}.`);
    } catch (error) {
      setAuthStatus(getErrorMessage(error));
    } finally {
      setAuthIsSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem('sharemeet.accessToken');
    setAccessToken(null);
    setAuthenticatedUser(null);
    setMyPosts([]);
    setMyPostsStatus('idle');
    setMyPostsError(null);
    setAuthStatus('Signed out.');
  }

  const activeFeedStatus = activeTab === 'Following' ? followingStatus : activeTab === 'My posts' ? myPostsStatus : feedStatus;

  const emptyStateMessage = useMemo(() => {
    if (activeTab === 'Following') {
      return 'No posts from followed users yet.';
    }

    if (activeTab === 'My posts') {
      return 'No posts yet. Share an update to get started.';
    }

    return 'No posts in this view yet.';
  }, [activeTab]);

  const activeFeedError = activeTab === 'Following' ? followingError : activeTab === 'My posts' ? myPostsError : feedError;

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Główna nawigacja">
        <div className="brand-lockup">
          <div className="brand-mark">S</div>
          <div>
            <strong>ShareMeet</strong>
            <span>social-tech MVP</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {(['Global', 'Following', 'My posts'] as const).map((tab) => (
            <button
              className={activeTab === tab ? 'nav-item active' : 'nav-item'}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              <span>{getTabIcon(tab)}</span>
              {tab}
            </button>
          ))}
          <button className="nav-item" type="button">
            <span>⌘</span>
            Profiles
          </button>
          <button className="nav-item" type="button">
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="auth-shortcuts" aria-label="Auth shortcuts">
          <button
            className={authMode === 'login' ? 'button ghost compact active-auth' : 'button ghost compact'}
            onClick={() => openAuth('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={authMode === 'register' ? 'button primary compact active-auth' : 'button primary compact'}
            onClick={() => openAuth('register')}
            type="button"
          >
            Register
          </button>
        </div>

        <div className="current-user-card">
          <Avatar accent="indigo" initials={activeUser.initials} />
          <div>
            <strong>{activeUser.name}</strong>
            <span>@{activeUser.username}</span>
          </div>
          {authenticatedUser && (
            <button className="logout-button" onClick={logout} type="button">
              Logout
            </button>
          )}
        </div>

        <div className="backend-status">
          <span className="status-dot" />
          {authenticatedUser ? 'Signed in' : 'Backend ready'}
          <small>{accessToken ? 'JWT stored locally' : '117 tests passing'}</small>
        </div>
      </aside>

      <main className="main-column">
        <section className="hero-strip" aria-labelledby="feed-title">
          <div>
            <p className="eyebrow">CORE SOCIAL MVP</p>
            <h1 id="feed-title">Dark social feed, built to show the backend.</h1>
            <p>
              Realny auth, feedy, composer, My posts, komentarze oraz panel profilu/follow są już
              podłączone do backendu. Następne slice’y to polish UX i kolejne funkcje społecznościowe.
            </p>
          </div>
          <div className="hero-actions">
            <button className="button ghost" onClick={() => openAuth('login')} type="button">
              Login
            </button>
            <button className="button primary" onClick={() => openAuth('register')} type="button">
              Register
            </button>
          </div>
        </section>

        {authMode && (
          <AuthPanel
            authEmail={authEmail}
            authIsSubmitting={authIsSubmitting}
            authMode={authMode}
            authPassword={authPassword}
            authStatus={authStatus}
            authUsername={authUsername}
            onClose={() => {
              setAuthMode(null);
              setAuthStatus(null);
            }}
            onEmailChange={setAuthEmail}
            onModeChange={openAuth}
            onPasswordChange={setAuthPassword}
            onSubmit={submitAuth}
            onUsernameChange={setAuthUsername}
          />
        )}

        <section className="composer-card" aria-label="Utwórz post">
          <textarea
            disabled={composerStatus === 'publishing'}
            onChange={(event) => {
              setComposerValue(event.target.value);
              if (composerStatus !== 'publishing') {
                setComposerStatus('idle');
                setComposerMessage(null);
              }
            }}
            placeholder={authenticatedUser ? 'Write an update for your network...' : 'Sign in to publish a real post...'}
            value={composerValue}
          />
          <div className="composer-footer">
            <div className="visibility-switcher" aria-label="Widoczność posta">
              {(['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const).map((option) => (
                <button
                  className={visibility === option ? 'visibility-pill active' : 'visibility-pill'}
                  disabled={composerStatus === 'publishing'}
                  key={option}
                  onClick={() => setVisibility(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              className="button primary"
              disabled={composerStatus === 'publishing'}
              onClick={() => void publishPost()}
              type="button"
            >
              {composerStatus === 'publishing' ? 'Publishing…' : 'Publish'}
            </button>
          </div>
          {composerMessage && (
            <div className={`composer-status composer-${composerStatus}`} role={composerStatus === 'error' ? 'alert' : 'status'}>
              {composerMessage}
            </div>
          )}
        </section>

        <div className="feed-toolbar">
          <div className="feed-tabs" aria-label="Feed filters">
            {(['Global', 'Following', 'My posts'] as const).map((tab) => (
              <button
                className={activeTab === tab ? 'feed-tab active' : 'feed-tab'}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="feed-sync-status">
            <span className={`sync-dot sync-${activeFeedStatus}`} />
            <span>{getFeedStatusLabel(activeFeedStatus, activeTab)}</span>
            <button className="refresh-button" onClick={refreshActiveFeed} type="button">
              Refresh
            </button>
          </div>
        </div>

        {activeFeedError && (
          <div className="feed-error" role="alert">
            {activeFeedError}
          </div>
        )}

        <section className="feed-list" aria-label="Posty">
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <strong>{activeTab === 'My posts' ? 'No own posts yet.' : 'No posts in this view yet.'}</strong>
              <span>
                {activeTab === 'My posts'
                  ? 'Publish a post or switch feed tabs.'
                  : 'Create a post or switch feed tabs.'}
              </span>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                accessToken={accessToken}
                authenticatedUser={authenticatedUser}
                isCommentsOpen={openComments === post.id}
                key={post.id}
                onDeleted={() => {
                  refreshActiveFeed();
                }}
                onRequireAuth={() => setAuthMode('login')}
                onToggleComments={() =>
                  setOpenComments((current) => (current === post.id ? null : post.id))
                }
                onUpdated={(updated: Post) => {
                  setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                  setFollowingPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                  setMyPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                  setProfilePosts((prev) =>
                    prev.map((p) =>
                      p.id === updated.id
                        ? { ...p, content: updated.content, visibility: updated.visibility, commentsCount: updated.commentsCount }
                        : p,
                    ),
                  );
                }}
                post={post}
              />
            ))
          )}
        </section>
      </main>

      <aside className="context-panel" aria-label="Profil i kontekst">
        {profileStatus === 'loading' && (
          <section className="profile-card">
            <div className="profile-gradient" />
            <div className="profile-avatar-placeholder" />
            <p className="muted-text">Loading profile…</p>
          </section>
        )}
        {profileStatus === 'error' && (
          <section className="profile-card">
            <div className="profile-gradient" />
            <p className="error-text" role="alert">{profileError ?? 'Failed to load profile.'}</p>
          </section>
        )}
        {profile && profileStatus !== 'loading' && (
          <section className="profile-card">
            <div className="profile-gradient" />
            <Avatar accent="warm" className="profile-avatar" initials={profileInitials(profile)} />
            <div className="profile-heading">
              <div>
                <h2>{profile.displayName ?? profile.username}</h2>
                <span>@{profile.username}</span>
              </div>
              <FollowButton
                accessToken={accessToken}
                isFollowing={profile.isFollowing ?? false}
                onRequireAuth={() => openAuth('login')}
                onUpdateProfile={(updated: Partial<ApiPublicProfile>) =>
                  setProfile((current) => (current ? { ...current, ...updated } : current))
                }
                profile={profile}
                setFollowActionStatus={setFollowActionStatus}
              />
            </div>
            <p>{profile.bio}</p>
            <div className="profile-stats">
              <StatCard label="followers" value={profile.followersCount ?? 0} />
              <StatCard label="following" value={profile.followingCount ?? 0} />
            </div>
            {followActionStatus !== 'idle' && (
              <div className="contract-row">
                <span>updating…</span>
              </div>
            )}
          </section>
        )}

        <section className="contract-card">
          <div className="section-heading">
            <span className="eyebrow">BACKEND CONTRACT</span>
            <h3>Visible portfolio features</h3>
          </div>
          <ul className="contract-list">
            <li>
              <span>profile counts</span>
              <code>followersCount</code>
            </li>
            <li>
              <span>viewer state</span>
              <code>isFollowing</code>
            </li>
            <li>
              <span>post privacy</span>
              <code>visibility</code>
            </li>
            <li>
              <span>comments</span>
              <code>commentsCount</code>
            </li>
          </ul>
        </section>

        <section className="contract-card" aria-label="Recent posts">
          <div className="section-heading">
            <span className="eyebrow">RECENT POSTS</span>
            <h3>@{profile?.username ?? 'maria'}</h3>
          </div>

          {profilePostsStatus === 'loading' && (
            <div className="contract-row"><span>Loading posts…</span></div>
          )}
          {profilePostsStatus === 'error' && (
            <div className="contract-row" role="alert"><span className="error-text">{profilePostsError ?? 'Failed to load posts.'}</span></div>
          )}
          {profilePostsStatus === 'ready' && profilePosts.length === 0 && (
            <div className="contract-row"><span className="muted-text">No posts yet.</span></div>
          )}
          {profilePostsStatus === 'ready' && profilePosts.length > 0 && (
            <ul className="contract-list">
              {profilePosts.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <span>{truncate(post.content, 60)}</span>
                  <span className="post-meta">
                    <code>{post.visibility}</code>
                    {' '}
                    <span>{post.commentsCount} comments</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}

function AuthPanel({
  authEmail,
  authIsSubmitting,
  authMode,
  authPassword,
  authStatus,
  authUsername,
  onClose,
  onEmailChange,
  onModeChange,
  onPasswordChange,
  onSubmit,
  onUsernameChange,
}: {
  authEmail: string;
  authIsSubmitting: boolean;
  authMode: AuthMode;
  authPassword: string;
  authStatus: string | null;
  authUsername: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onUsernameChange: (value: string) => void;
}) {
  const isRegister = authMode === 'register';

  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <div className="auth-copy">
        <p className="eyebrow">AUTH FLOW</p>
        <h2 id="auth-title">{isRegister ? 'Create your ShareMeet account.' : 'Welcome back to ShareMeet.'}</h2>
        <p>
          Realny auth flow korzysta z backendu: `POST /auth/{isRegister ? 'register' : 'login'}`
          oraz `GET /auth/me`. Token JWT jest zapisywany lokalnie dla kolejnych requestów.
        </p>
        <div className="auth-contract-grid" aria-label="Auth API contract preview">
          <code>POST /auth/register</code>
          <code>POST /auth/login</code>
          <code>GET /auth/me</code>
        </div>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="auth-mode-switch" role="tablist" aria-label="Auth mode">
          <button
            aria-selected={authMode === 'login'}
            className={authMode === 'login' ? 'feed-tab active' : 'feed-tab'}
            onClick={() => onModeChange('login')}
            role="tab"
            type="button"
          >
            Login
          </button>
          <button
            aria-selected={authMode === 'register'}
            className={authMode === 'register' ? 'feed-tab active' : 'feed-tab'}
            onClick={() => onModeChange('register')}
            role="tab"
            type="button"
          >
            Register
          </button>
        </div>

        {isRegister && (
          <FormField
            label="Username"
            name="username"
            onChange={onUsernameChange}
            placeholder="z1gonzo"
            value={authUsername}
            disabled={authIsSubmitting}
          />
        )}
        <FormField
          label="Email"
          name="email"
          onChange={onEmailChange}
          placeholder="lukasz@example.com"
          type="email"
          value={authEmail}
          disabled={authIsSubmitting}
        />
        <FormField
          label="Password"
          name="password"
          onChange={onPasswordChange}
          placeholder="minimum 8 characters"
          type="password"
          value={authPassword}
          disabled={authIsSubmitting}
        />

        <div className="auth-form-actions">
          <button className="button ghost" disabled={authIsSubmitting} onClick={onClose} type="button">
            Close
          </button>
          <button className="button primary" disabled={authIsSubmitting} type="submit">
            {authIsSubmitting ? 'Connecting…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </div>

        {authStatus && <div className="auth-status">{authStatus}</div>}
      </form>
    </section>
  );
}

function FormField({
  disabled = false,
  label,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  disabled?: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'email' | 'password' | 'text';
  value: string;
}) {
  return (
    <label className="form-field" htmlFor={name}>
      <span>{label}</span>
      <input
        autoComplete={name === 'password' ? 'current-password' : name}
        disabled={disabled}
        id={name}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function profileInitials(profile: ApiPublicProfile) {
  return (profile.displayName ?? profile.username).slice(0, 1).toUpperCase();
}

function FollowButton({
  accessToken,
  isFollowing,
  onRequireAuth,
  onUpdateProfile,
  profile,
  setFollowActionStatus,
}: {
  accessToken: string | null;
  isFollowing: boolean;
  onRequireAuth: () => void;
  onUpdateProfile: (updated: Partial<ApiPublicProfile>) => void;
  profile: ApiPublicProfile;
  setFollowActionStatus: (status: 'idle' | 'loading') => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggleFollow() {
    if (!accessToken) {
      setError('Sign in to follow profiles.');
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    setFollowActionStatus('loading');
    setError(null);

    try {
      if (isFollowing) {
        await unfollowUser(profile.username, accessToken);
        onUpdateProfile({
          followersCount: Math.max(0, (profile.followersCount ?? 0) - 1),
          isFollowing: false,
        });
      } else {
        await followUser(profile.username, accessToken);
        onUpdateProfile({
          followersCount: (profile.followersCount ?? 0) + 1,
          isFollowing: true,
        });
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      setFollowActionStatus('idle');
    }
  }

  return (
    <div className="follow-control">
      <button
        className={isFollowing ? 'button success' : 'button primary'}
        disabled={isSubmitting}
        onClick={() => void toggleFollow()}
        type="button"
      >
        {isSubmitting ? 'Updating…' : isFollowing ? 'Following' : 'Follow'}
      </button>
      {error && <span className="profile-action-error">{error}</span>}
    </div>
  );
}

function PostCard({
  accessToken,
  authenticatedUser,
  isCommentsOpen,
  onDeleted,
  onRequireAuth,
  onToggleComments,
  onUpdated,
  post,
}: {
  accessToken: string | null;
  authenticatedUser: PublicUser | null;
  isCommentsOpen: boolean;
  onDeleted: () => void;
  onRequireAuth: () => void;
  onToggleComments: () => void;
  onUpdated: (updated: Post) => void;
  post: Post;
}) {
  const [comments, setComments] = useState<CommentItem[]>(post.comments);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentStatus, setCommentStatus] = useState<'idle' | 'loading' | 'ready' | 'posting' | 'error'>('idle');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Post edit/delete state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content);
  const [editPostVisibility, setEditPostVisibility] = useState<Visibility>(post.visibility);
  const [postActionStatus, setPostActionStatus] = useState<'idle' | 'updating' | 'deleting' | 'error'>('idle');
  const [postActionError, setPostActionError] = useState<string | null>(null);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentActionStatus, setCommentActionStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const isOwner = !!authenticatedUser && authenticatedUser.username === post.author.username;

  useEffect(() => {
    if (!isCommentsOpen) {
      setEditingCommentId(null);
      return;
    }

    let cancelled = false;
    setCommentStatus('loading');
    setCommentError(null);

    getPostComments(post.id)
      .then((apiComments) => {
        if (!cancelled) {
          setComments(apiComments.map(mapApiComment));
          setCommentStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCommentStatus('error');
          setCommentError(getErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isCommentsOpen, post.id]);

  function startEditPost() {
    setIsEditingPost(true);
    setEditPostContent(post.content);
    setEditPostVisibility(post.visibility);
    setPostActionError(null);
  }

  function cancelEditPost() {
    setIsEditingPost(false);
    setEditPostContent(post.content);
    setEditPostVisibility(post.visibility);
    setPostActionError(null);
  }

  async function submitPostEdit() {
    if (!accessToken || !authenticatedUser) {
      setPostActionError('Sign in to edit posts.');
      onRequireAuth();
      return;
    }

    if (!editPostContent.trim()) {
      setPostActionError('Post content cannot be empty.');
      return;
    }

    setPostActionStatus('updating');
    setPostActionError(null);

    try {
      const updated = await updatePost(
        post.id,
        { content: editPostContent.trim(), visibility: editPostVisibility },
        accessToken,
      );
      const mapped = mapApiPost(updated);
      onUpdated(mapped);
      setIsEditingPost(false);
      setPostActionStatus('idle');
    } catch (error) {
      setPostActionStatus('error');
      setPostActionError(getErrorMessage(error));
    }
  }

  async function submitPostDelete() {
    if (!accessToken || !authenticatedUser) {
      setPostActionError('Sign in to delete posts.');
      onRequireAuth();
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setPostActionStatus('deleting');
    setPostActionError(null);

    try {
      await deletePost(post.id, accessToken);
      setPostActionStatus('idle');
      onDeleted();
    } catch (error) {
      setPostActionStatus('error');
      setPostActionError(getErrorMessage(error));
    }
  }

  async function startEditComment(comment: CommentItem) {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
    setCommentActionStatus('idle');
  }

  async function submitCommentEdit() {
    if (!accessToken || !authenticatedUser) {
      setCommentActionStatus('error');
      onRequireAuth();
      return;
    }

    if (!editingCommentId) return;
    if (!editingCommentText.trim()) {
      setCommentActionStatus('error');
      setCommentError('Comment cannot be empty.');
      return;
    }

    setCommentActionStatus('loading');
    setCommentError(null);

    try {
      const updated = await updateComment(editingCommentId, { content: editingCommentText.trim() }, accessToken);
      setComments((prev) => prev.map((c) => (c.id === editingCommentId ? mapApiComment(updated) : c)));
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentActionStatus('idle');
    } catch (error) {
      setCommentActionStatus('error');
      setCommentError(getErrorMessage(error));
    }
  }

  async function submitCommentDelete(commentId: string) {
    if (!accessToken || !authenticatedUser) {
      onRequireAuth();
      return;
    }

    if (!window.confirm('Delete this comment?')) {
      return;
    }

    setCommentActionStatus('loading');
    setCommentError(null);

    try {
      await deleteComment(commentId, accessToken);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingCommentText('');
      }
      setCommentActionStatus('idle');
    } catch (error) {
      setCommentActionStatus('error');
      setCommentError(getErrorMessage(error));
    }
  }

  async function submitComment() {
    const content = commentDraft.trim();

    if (!content) {
      setCommentStatus('error');
      setCommentError('Write a comment before posting.');
      return;
    }

    if (!accessToken) {
      setCommentStatus('error');
      setCommentError('Sign in to comment.');
      onRequireAuth();
      return;
    }

    setCommentStatus('posting');
    setCommentError(null);

    try {
      const createdComment = await createComment(post.id, { content }, accessToken);
      setComments((currentComments) => [mapApiComment(createdComment), ...currentComments]);
      setCommentDraft('');
      setCommentStatus('ready');
    } catch (error) {
      setCommentStatus('error');
      setCommentError(getErrorMessage(error));
    }
  }

  const visibleCommentsCount = Math.max(post.commentsCount, comments.length);

  return (
    <article className="post-card">
      <header className="post-header">
        <Avatar accent={post.author.accent} initials={post.author.initials} />
        <div>
          <strong>{post.author.name}</strong>
          <span>
            @{post.author.username} · {post.createdAt} · {post.author.role}
          </span>
        </div>
        <VisibilityBadge visibility={post.visibility} />
      </header>
      {isEditingPost ? (
        <div className="post-edit-panel">
          <div className="edit-panel-heading">
            <span>Editing post</span>
            <small>Owner controls</small>
          </div>
          <textarea
            className="post-edit-textarea"
            rows={3}
            value={editPostContent}
            onChange={(e) => setEditPostContent(e.target.value)}
          />
          <div className="edit-panel-actions">
            <select
              className="visibility-select"
              value={editPostVisibility}
              onChange={(e) => setEditPostVisibility(e.target.value as Visibility)}
            >
              {(['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <button
              className="button primary compact"
              disabled={postActionStatus === 'updating'}
              onClick={() => void submitPostEdit()}
              type="button"
            >
              {postActionStatus === 'updating' ? 'Saving…' : 'Save'}
            </button>
            <button
              className="button ghost compact"
              disabled={postActionStatus === 'updating'}
              onClick={cancelEditPost}
              type="button"
            >
              Cancel
            </button>
            {postActionError && <span className="comment-error inline-error">{postActionError}</span>}
          </div>
        </div>
      ) : (
        <p>{post.content}</p>
      )}
      <footer className="post-actions">
        <button onClick={onToggleComments} type="button">
          💬 {visibleCommentsCount} comments
        </button>
        <button type="button">↗ Share</button>
        {isOwner && (
          <div className="owner-action-group" aria-label="Post owner actions">
            <button className="owner-action-button" onClick={() => setIsEditingPost((p) => !p)} disabled={postActionStatus === 'updating'} type="button">
              {isEditingPost ? 'Close' : 'Edit'}
            </button>
            <button className="owner-action-button danger" onClick={() => void submitPostDelete()} disabled={postActionStatus === 'deleting'} type="button">
              {postActionStatus === 'deleting' ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </footer>
      {postActionError && !isEditingPost && <span className="comment-error">{postActionError}</span>}
      {isCommentsOpen && (
        <div className="comments-panel">
          <div className="comment-form">
            <input
              disabled={commentStatus === 'posting'}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder={accessToken ? 'Add a thoughtful comment…' : 'Sign in to comment…'}
              value={commentDraft}
            />
            <button disabled={commentStatus === 'posting'} onClick={() => void submitComment()} type="button">
              {commentStatus === 'posting' ? 'Posting…' : 'Comment'}
            </button>
          </div>

          {commentStatus === 'loading' && <span className="muted-text">Loading comments…</span>}
          {commentError && <span className="comment-error">{commentError}</span>}

          {commentStatus !== 'loading' && comments.length === 0 ? (
            <span className="muted-text">No comments yet.</span>
          ) : (
            comments.map((comment) => {
              const commentOwner = authenticatedUser?.username === comment.author.username;
              return (
                <div className="comment-row" key={comment.id}>
                  <Avatar accent={pickAuthorAccent(comment.author.username)} initials={comment.author.initials} small />
                  <div className="comment-content">
                    <strong>{comment.author.name}</strong>
                    {editingCommentId === comment.id ? (
                      <div className="comment-edit-panel">
                        <input
                          className="comment-edit-input"
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                        />
                        <div className="comment-edit-actions">
                          <button className="button primary compact" disabled={commentActionStatus === 'loading'} onClick={() => void submitCommentEdit()} type="button">Save</button>
                          <button className="button ghost compact" disabled={commentActionStatus === 'loading'} onClick={() => setEditingCommentId(null)} type="button">Cancel</button>
                        </div>
                        {commentActionStatus === 'error' && <span className="comment-error inline-error">{commentError}</span>}
                      </div>
                    ) : (
                      <span>{comment.text}</span>
                    )}
                  </div>
                  {commentOwner && editingCommentId !== comment.id && (
                    <div className="comment-owner-actions" aria-label="Comment owner actions">
                      <button className="owner-action-button compact" onClick={() => startEditComment(comment)} type="button">Edit</button>
                      <button className="owner-action-button compact danger" onClick={() => void submitCommentDelete(comment.id)} type="button">Delete</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </article>
  );
}

function Avatar({
  accent,
  className,
  initials,
  small = false,
}: {
  accent: Author['accent'];
  className?: string;
  initials: string;
  small?: boolean;
}) {
  return (
    <div className={`avatar avatar-${accent} ${small ? 'avatar-small' : ''} ${className ?? ''}`}>
      {initials}
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return <span className={`visibility-badge visibility-${visibility.toLowerCase()}`}>{visibility}</span>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getTabIcon(tab: FeedTab) {
  if (tab === 'Global') return '◎';
  if (tab === 'Following') return '◆';
  return '◉';
}

function mapApiPost(post: ApiPost): Post {
  const displayName = post.author.displayName ?? post.author.username;

  return {
    id: post.id,
    author: {
      initials: displayName.slice(0, 1).toUpperCase(),
      name: displayName,
      username: post.author.username,
      role: post.author.isPrivate ? 'Private profile' : 'ShareMeet user',
      accent: pickAuthorAccent(post.author.username),
    },
    comments: [],
    commentsCount: post.commentsCount,
    content: post.content,
    createdAt: formatRelativeTime(post.createdAt),
    visibility: post.visibility,
  };
}

function mapApiComment(comment: ApiComment): CommentItem {
  const displayName = comment.author.displayName ?? comment.author.username;

  return {
    id: comment.id,
    author: {
      initials: displayName.slice(0, 1).toUpperCase(),
      name: displayName,
      username: comment.author.username,
    },
    text: comment.content,
  };
}

function pickAuthorAccent(username: string): Author['accent'] {
  const accents: Array<Author['accent']> = ['indigo', 'emerald', 'warm'];
  const sum = [...username].reduce((total, char) => total + char.charCodeAt(0), 0);
  return accents[sum % accents.length];
}

function formatRelativeTime(isoDate: string) {
  const timestamp = new Date(isoDate).getTime();

  if (Number.isNaN(timestamp)) {
    return 'recently';
  }

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return 'teraz';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function getFeedStatusLabel(status: FeedStatus, activeTab: FeedTab) {
  const feedName = activeTab === 'My posts' ? 'My posts' : 'Feed';
  if (status === 'loading') return `Syncing ${feedName}`;
  if (status === 'ready') return activeTab === 'My posts' ? 'My posts from API' : 'Live from API';
  if (status === 'error') return `${feedName} API error`;
  return `${feedName} pending`;
}

function getInitials(user: PublicUser) {
  const name = user.displayName ?? user.username;
  return name.slice(0, 1).toUpperCase();
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return `${error.status}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown API error';
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
