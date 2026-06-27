# Profile content policy

Status: lightweight policy / backlog note
Date: 2026-06-27

## Scope

This document covers early profile content rules for ShareMeet, especially public avatar URLs.

Current implementation:

- `avatarUrl` is a plain URL field on `User`.
- `avatarUrl` is visible in public profiles through `GET /users/:username`.
- ShareMeet does not yet upload, host, proxy, scan, or moderate images.

## Decision for now

Do not block profile work on avatar moderation.

For the current MVP stage:

- avatars may stay public,
- `avatarUrl` stays a normal URL field,
- no moderation pipeline is implemented yet,
- reporting/moderation is tracked as future work,
- if content becomes a real problem, the simple fallback is to remove or hide the offending `avatarUrl` and show a placeholder.

## Disallowed avatar content

When moderation/reporting exists, these avatar categories should be disallowed:

- nudity or explicit sexual content,
- graphic violence or gore,
- hateful or extremist symbols,
- harassment or impersonation,
- illegal content,
- malware/phishing/tracking image URLs.

## Future implementation options

### Minimal report-based approach

Good enough for an early social MVP:

1. Add `Report` model/table.
2. Allow users to report a profile/avatar.
3. Store report reason and optional note.
4. Admin/manual review decides whether to clear `avatarUrl`.
5. If cleared, public profile shows a generated/default placeholder.

This avoids spending too much time on automated moderation before the product has users.

### Later upload/moderation approach

If ShareMeet later hosts avatars:

1. Upload image to own storage.
2. Mark avatar as `pending`.
3. Run image moderation before making it public.
4. Store `avatarModerationStatus`: `pending`, `approved`, `rejected`.
5. Public profile shows avatar only when approved.
6. Rejected avatars show a placeholder.

## Current backlog item

Do not implement this now unless needed. Track it as:

> Add profile/avatar reporting and moderation fallback.

This can wait until after basic posts or when public profile abuse becomes a real product concern.
