# Security Specification — Bona Occasio (Phase 0 TDD)

## 1. Data Invariants
1. **Owner-Only Mutations**: Only the verified owner (`gustavofirmino0511@gmail.com` with `email_verified == true` or an entry in `/admins/{uid}`) may create, update, or delete documents in `/products/{productId}`, `/categories/{categoryId}`, or `/admins/{adminId}`.
2. **Public Catalog Visibility**: Visitors may only `get` or `list` documents in `/products/{productId}` and `/categories/{categoryId}` where `resource.data.isPublic == true`.
3. **Strict Schema & Bounds**: Every string field enforces strict `.size()` limits matching `firebase-blueprint.json`, arrays (`specs`, `pros`, `cons`) are bounded in length and element type, and `authorUid` must match `request.auth.uid`.
4. **Immutable Audit Fields**: `id`, `authorUid`, and `createdAt` cannot be modified during `update`, and timestamps (`createdAt`, `updatedAt`) must match `request.time`.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Product Creation**: `auth = null` attempting `create` on `/products/prod-1` -> `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: `auth = { uid: 'u1', token: { email: 'gustavofirmino0511@gmail.com', email_verified: false } }` attempting `create` on `/products/prod-1` -> `PERMISSION_DENIED`.
3. **Non-Admin Authenticated Write**: `auth = { uid: 'intruder', token: { email: 'hacker@example.com', email_verified: true } }` attempting `create` on `/products/prod-1` -> `PERMISSION_DENIED`.
4. **Identity Spoofing (`authorUid` mismatch)**: Admin attempting `create` on `/products/prod-1` with `authorUid: 'other-user'` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Create**: Admin attempting `create` on `/products/prod-1` with extra key `isSuperFeatured: true` -> `PERMISSION_DENIED`.
6. **Shadow Field Injection on Update**: Admin attempting `update` on `/products/prod-1` modifying `hackedField: 'yes'` -> `PERMISSION_DENIED`.
7. **Immutable Field Mutation (`createdAt` / `authorUid`)**: Admin attempting `update` on `/products/prod-1` changing `authorUid` -> `PERMISSION_DENIED`.
8. **Client Timestamp Forgery**: Admin attempting `create` on `/products/prod-1` with `createdAt` not equal to `request.time` -> `PERMISSION_DENIED`.
9. **Resource Poisoning (Oversized ID / String)**: Attempting `create` on `/products/{150-char-id}` or `name` > 160 chars -> `PERMISSION_DENIED`.
10. **Unbounded Array Injection**: Admin attempting `create` on `/products/prod-1` with `specs` array of 50 items (exceeding max 20) -> `PERMISSION_DENIED`.
11. **Unpublished Document Leak**: Visitor attempting `get` or `list` on `/products/secret-draft` where `isPublic == false` -> `PERMISSION_DENIED`.
12. **Self-Privilege Escalation on `/admins/{uid}`**: Non-owner user attempting `create` on `/admins/intruder` -> `PERMISSION_DENIED`.
