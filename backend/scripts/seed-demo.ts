/**
 * Deterministic demo seed for ShareMeet backend.
 * Idempotent: safe to run multiple times without duplicating records.
 *
 * Users:   z1gonzo, maria, adam, kasia
 * Posts:    PUBLIC, FOLLOWERS, PRIVATE across users
 * Follows:  z1gonzo → maria, maria → adam, adam → z1gonzo, kasia → z1gonzo
 * Comments: on various posts
 *
 * All demo records are identified by stable deterministic uuids derived
 * from usernames, so we can upsert/delete safely without affecting other data.
 *
 * Run: npx ts-node scripts/seed-demo.ts
 */
import { PrismaClient, PostVisibility } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Deterministic UUID v5-like helper (simple hash-based for stability)
// Uses built-in crypto from Node.js for deterministic output
// ---------------------------------------------------------------------------
function deterministicUuid(seed: string): string {
  const { createHash } = require('crypto');
  const hash = createHash('sha256').update(seed).digest('hex');
  // Map to UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).slice(0, 2) +
      hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}

// ---------------------------------------------------------------------------
// Demo data definitions (stable content)
// ---------------------------------------------------------------------------
const DEMO_PASSWORD = 'DemoPass123!';

interface DemoUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}

interface DemoPost {
  id: string;
  authorUsername: string;
  content: string;
  visibility: PostVisibility;
}

interface DemoComment {
  id: string;
  postId: string;
  authorUsername: string;
  content: string;
}

const demoUsers: DemoUser[] = [
  {
    id: deterministicUuid('demo-user-z1gonzo'),
    email: 'z1gonzo@sharemeet.local',
    username: 'z1gonzo',
    displayName: 'Łukasz',
    bio: 'Building ShareMeet one slice at a time. 🇵🇱',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=z1gonzo',
  },
  {
    id: deterministicUuid('demo-user-maria'),
    email: 'maria@sharemeet.local',
    username: 'maria',
    displayName: 'Maria',
    bio: 'Frontend enthusiast & UI craftsperson.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
  },
  {
    id: deterministicUuid('demo-user-adam'),
    email: 'adam@sharemeet.local',
    username: 'adam',
    displayName: 'Adam',
    bio: 'Full-stack tinkerer. Coffee first, code later.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=adam',
  },
  {
    id: deterministicUuid('demo-user-kasia'),
    email: 'kasia@sharemeet.local',
    username: 'kasia',
    displayName: 'Kasia',
    bio: 'DevOps by day, board games by night.',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kasia',
  },
];

const demoPosts: DemoPost[] = [
  // z1gonzo posts
  {
    id: deterministicUuid('demo-post-z1gonzo-public-1'),
    authorUsername: 'z1gonzo',
    content:
      'Just shipped the first auth flow for ShareMeet. JWT access tokens working end-to-end with NestJS + Prisma. 🚀',
    visibility: PostVisibility.PUBLIC,
  },
  {
    id: deterministicUuid('demo-post-z1gonzo-followers-1'),
    authorUsername: 'z1gonzo',
    content:
      'Behind the scenes: deciding between offset and cursor pagination. Offset is simpler to teach; cursor is faster at scale. We start with offset.',
    visibility: PostVisibility.FOLLOWERS,
  },
  {
    id: deterministicUuid('demo-post-z1gonzo-private-1'),
    authorUsername: 'z1gonzo',
    content:
      'Draft post: planning the realtime layer. WebSockets or Server-Sent Events? Still weighing trade-offs.',
    visibility: PostVisibility.PRIVATE,
  },
  // maria posts
  {
    id: deterministicUuid('demo-post-maria-public-1'),
    authorUsername: 'maria',
    content:
      'Designed a dark-themed social layout inspired by Linear and Vercel. Focus on readability and subtle depth. ✨',
    visibility: PostVisibility.PUBLIC,
  },
  {
    id: deterministicUuid('demo-post-maria-public-2'),
    authorUsername: 'maria',
    content:
      'Quick tip: use CSS custom properties for theme tokens early. It saves hours when the design system evolves.',
    visibility: PostVisibility.PUBLIC,
  },
  // adam posts
  {
    id: deterministicUuid('demo-post-adam-public-1'),
    authorUsername: 'adam',
    content:
      'Docker Compose setup with PostgreSQL on a custom host port (5433) to avoid conflicts. Small win, big sanity save.',
    visibility: PostVisibility.PUBLIC,
  },
  {
    id: deterministicUuid('demo-post-adam-followers-1'),
    authorUsername: 'adam',
    content:
      'Thinking about adding Redis for session caching. Not needed yet, but good to know where the seam is.',
    visibility: PostVisibility.FOLLOWERS,
  },
  // kasia posts
  {
    id: deterministicUuid('demo-post-kasia-public-1'),
    authorUsername: 'kasia',
    content:
      'CI/CD lesson learned: run lint + build + test in parallel jobs. Catches failures faster and gives clearer feedback.',
    visibility: PostVisibility.PUBLIC,
  },
];

const demoComments: DemoComment[] = [
  // On z1gonzo's public post
  {
    id: deterministicUuid('demo-comment-maria-1'),
    postId: deterministicUuid('demo-post-z1gonzo-public-1'),
    authorUsername: 'maria',
    content: 'Clean architecture choice! Prisma + NestJS is a solid combo.',
  },
  {
    id: deterministicUuid('demo-comment-adam-1'),
    postId: deterministicUuid('demo-post-z1gonzo-public-1'),
    authorUsername: 'adam',
    content: 'Love the transparent approach — teaching while building.',
  },
  // On maria's first public post
  {
    id: deterministicUuid('demo-comment-z1gonzo-1'),
    postId: deterministicUuid('demo-post-maria-public-1'),
    authorUsername: 'z1gonzo',
    content: 'The depth effect on the cards is subtle but really polished.',
  },
  // On adam's public post
  {
    id: deterministicUuid('demo-comment-kasia-1'),
    postId: deterministicUuid('demo-post-adam-public-1'),
    authorUsername: 'kasia',
    content: 'Port 5433 club! 🙌',
  },
];

// ---------------------------------------------------------------------------
// Follow graph definition (follower -> following)
// ---------------------------------------------------------------------------
const demoFollows: [string, string][] = [
  ['z1gonzo', 'maria'],
  ['maria', 'adam'],
  ['adam', 'z1gonzo'],
  ['kasia', 'z1gonzo'],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function upsertDemoUsers() {
  console.log('Seeding demo users...');
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  for (const u of demoUsers) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: u.email }, { username: u.username }],
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: u.username,
          email: u.email,
          passwordHash,
          displayName: u.displayName,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          id: u.id,
          email: u.email,
          username: u.username,
          passwordHash,
          displayName: u.displayName,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
        },
      });
    }
  }
  console.log(`  → ${demoUsers.length} demo users upserted.`);
}

async function upsertDemoPosts() {
  console.log('Seeding demo posts...');

  for (const p of demoPosts) {
    const author = await prisma.user.findUnique({
      where: { username: p.authorUsername },
      select: { id: true },
    });
    if (!author) {
      throw new Error(`Unknown author: ${p.authorUsername}`);
    }

    await prisma.post.upsert({
      where: { id: p.id },
      update: {
        content: p.content,
        visibility: p.visibility,
        authorId: author.id,
      },
      create: {
        id: p.id,
        content: p.content,
        visibility: p.visibility,
        authorId: author.id,
      },
    });
  }
  console.log(`  → ${demoPosts.length} demo posts upserted.`);
}

async function upsertDemoComments() {
  console.log('Seeding demo comments...');

  for (const c of demoComments) {
    const author = await prisma.user.findUnique({
      where: { username: c.authorUsername },
      select: { id: true },
    });
    if (!author) {
      throw new Error(`Unknown comment author: ${c.authorUsername}`);
    }

    await prisma.comment.upsert({
      where: { id: c.id },
      update: {
        content: c.content,
        postId: c.postId,
        authorId: author.id,
      },
      create: {
        id: c.id,
        content: c.content,
        postId: c.postId,
        authorId: author.id,
      },
    });
  }
  console.log(`  → ${demoComments.length} demo comments upserted.`);
}

async function upsertDemoFollows() {
  console.log('Seeding demo follows...');

  for (const [followerUsername, followingUsername] of demoFollows) {
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({
        where: { username: followerUsername },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { username: followingUsername },
        select: { id: true },
      }),
    ]);
    if (!follower || !following) {
      throw new Error(
        `Invalid follow pair: ${followerUsername} -> ${followingUsername}`,
      );
    }

    // Follow has a composite key, not an id; use deleteMany + create for idempotency
    // Since we can't upsert on Follow (composite unique), we delete then create.
    await prisma.follow.deleteMany({
      where: {
        followerId: follower.id,
        followingId: following.id,
      },
    });

    await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
    });
  }
  console.log(`  → ${demoFollows.length} demo follows upserted.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== ShareMeet Demo Seed ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  await upsertDemoUsers();
  await upsertDemoPosts();
  await upsertDemoFollows();
  await upsertDemoComments();

  console.log('');
  console.log('✅ Demo seed complete.');
  console.log(`   Users:    ${demoUsers.length}`);
  console.log(`   Posts:    ${demoPosts.length}`);
  console.log(`   Follows:  ${demoFollows.length}`);
  console.log(`   Comments: ${demoComments.length}`);
  console.log(`   Demo password (all users): ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('❌ Demo seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
