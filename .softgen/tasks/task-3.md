---
title: Authentication & Onboarding
status: todo
priority: high
type: feature
tags: [auth, onboarding, frontend]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 3
---

## Notes
Auth modal with sign in/up views, PayPal subscription integration. 5-step onboarding flow saving to profiles table. Middleware for route protection.

## Checklist
- [ ] Create auth modal component (sign in and sign up views)
- [ ] Integrate PayPal JS SDK for subscription button
- [ ] Create authService.ts with sign in/up/out methods
- [ ] Build onboarding page with 5 steps (welcome, situation, budget, goals, first pick)
- [ ] Create middleware for /app and /admin route protection
- [ ] Implement onboarding progress saving to Supabase profiles

## Acceptance
- Users can sign up/in via email + password
- Member plan signup shows PayPal subscription button
- Onboarding completes and redirects to dashboard
- Admin users redirect to /admin, members to /app/dashboard
