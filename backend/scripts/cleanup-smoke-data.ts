/**
 * Safe smoke-test data cleanup script for ShareMeet backend.
 *
 * Dry-run by default. Only removes when --apply is passed explicitly.
 *
 * Design decisions:
 * - This script is intentionally conservative. If a pattern is not on the
 *   strict allow-list, we do NOT delete it. See isSmokeUser() below.
 * - Protected demo users (z1gonzo, maria, adam, kasia) are always excluded.
 * - The script runs in a Prisma $transaction for atomicity when --apply is used.
 *
 * Usage:
 *   npx ts-node scripts/cleanup-smoke-data.ts           # dry run (default)
 *   npx ts-node scripts/cleanup-smoke-data.ts --apply   # real deletion
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Strict allow-list of smoke-test username / email prefix / domain patterns.
// Only concrete, known test prefixes — if something is ambiguous, skip it.
// ---------------------------------------------------------------------------
const KNOWN_SMOKE_PREFIXES = [
  'uiowner',
  'owneractions',
  'comments',
  'profilefollower',
  'following',
  'followed',
  'feed',
  'demo-smoke',
  'demo_smoke',
] as const;

const KNOWN_SMOKE_REGEXES = [/^ui\d/i];

const KNOWN_SMOKE_DOMAINS = ['example.com'];

const PROTECTED_USERNAMES = ['z1gonzo', 'maria', 'adam', 'kasia'];

function isSmokeUser(user: { username: string; email: string }): boolean {
  const usernameLower = user.username.toLowerCase();
  const emailLower = user.email.toLowerCase();

  // Never touch protected demo users
  if (PROTECTED_USERNAMES.includes(usernameLower)) {
    return false;
  }

  // Match known smoke-test prefixes in username. Keep this strict: for example,
  // generic `ui*` is not enough, but `ui123...` is a known browser smoke shape.
  const prefixMatch = KNOWN_SMOKE_PREFIXES.some((prefix) =>
    usernameLower.startsWith(prefix.toLowerCase()),
  );
  const regexMatch = KNOWN_SMOKE_REGEXES.some((regex) => regex.test(user.username));

  // Match known smoke-test prefix in email local part (before @)
  const emailPrefixMatch = KNOWN_SMOKE_PREFIXES.some((prefix) =>
    emailLower.startsWith(prefix.toLowerCase() + '@'),
  );
  const emailRegexMatch = KNOWN_SMOKE_REGEXES.some((regex) => regex.test(emailLower.split('@')[0] ?? ''));

  // Match known smoke-test domains
  const domainMatch = KNOWN_SMOKE_DOMAINS.some((domain) =>
    emailLower.endsWith(`@${domain.toLowerCase()}`),
  );

  return prefixMatch || regexMatch || emailPrefixMatch || emailRegexMatch || domainMatch;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const apply = process.argv.includes('--apply');

  console.log('=== ShareMeet Smoke Data Cleanup ===');
  console.log(`Mode: ${apply ? 'APPLY (real deletion)' : 'DRY RUN (preview only)'}`);
  console.log('');

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
          comments: true,
        },
      },
    },
  });

  const candidates = allUsers.filter((u) => isSmokeUser(u));

  if (candidates.length === 0) {
    console.log('No smoke-test candidate users found.');
    console.log('');
    console.log('✅ Nothing to clean up.');
    return;
  }

  // Summary table
  const totalPosts = candidates.reduce((sum, u) => sum + u._count.posts, 0);
  const totalComments = candidates.reduce((sum, u) => sum + u._count.comments, 0);
  const totalFollows = candidates.reduce((sum, u) => sum + u._count.followers + u._count.following, 0);

  console.log(`Found ${candidates.length} smoke-test candidate(s):`);
  console.log('');

  for (const u of candidates) {
    console.log(`  [${u.id}] ${u.username} <${u.email}>`);
    console.log(`    posts: ${u._count.posts}, comments: ${u._count.comments}, follows: ${u._count.followers + u._count.following}`);
  }

  console.log('');
  console.log(`Summary for ALL candidates:`);
  console.log(`  Users:    ${candidates.length}`);
  console.log(`  Posts:    ${totalPosts}`);
  console.log(`  Comments: ${totalComments}`);
  console.log(`  Follows:  ${totalFollows}`);
  console.log('');

  if (!apply) {
    console.log('🚫 This was a DRY RUN. No changes were made.');
    console.log('   To actually delete these records, run with --apply flag.');
    return;
  }

  // Real deletion within a transaction for safety
  const candidateIds = candidates.map((c) => c.id);

  await prisma.$transaction(async (tx) => {
    // Prisma's onDelete: Cascade will handle linked records when we delete
    // delete users linked records through relations defined in schema.
    // However, Follow model relations do not have onDelete: Cascade in the
    // current schema for the join rows themselves (Follow has two user FKs
    // with onDelete: Cascade on each side, so deleting a user will delete
    // the Follow rows where that user is follower or following).

    const { count } = await tx.user.deleteMany({
      where: { id: { in: candidateIds } },
    });

    console.log(`  → Deleted ${count} user(s) and their cascaded records.`);
  });

  console.log('');
  console.log('✅ Cleanup complete.');
}

main()
  .catch((err) => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
