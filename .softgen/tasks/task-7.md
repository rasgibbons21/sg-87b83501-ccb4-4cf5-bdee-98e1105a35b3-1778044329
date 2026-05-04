---
title: PWA Setup & Polish
status: in_progress
priority: medium
type: chore
tags: [pwa, polish]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 7
---

## Notes
Add PWA manifest, middleware for auth protection, loading states, error boundaries, mobile responsive design.

## Checklist
- [x] Create public/manifest.json with Bloom branding
- [x] Add PWA meta tags to _document.tsx
- [x] Create middleware.ts for /app and /admin route protection
- [x] Middleware checks onboarding_completed and role
- [ ] Add loading skeletons to data-fetching pages
- [ ] Wrap major sections in error boundaries
- [ ] Test mobile responsive across all pages

## Acceptance
- PWA installs correctly on iOS/Android/Desktop
- Protected routes redirect unauthenticated users
- Toast notifications work across all actions
- Loading states show during data fetching
- Mobile responsive on all pages
