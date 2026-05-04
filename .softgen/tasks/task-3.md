---
title: Authentication & Onboarding
status: done
priority: high
type: feature
tags: [auth, onboarding]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 3
---

## Notes
Build auth modal with sign in/sign up + PayPal integration. Create 5-step onboarding flow saving progress to profiles table. Redirect based on role and onboarding status.

## Checklist
- [x] Create AuthModal component with sign in and sign up views
- [x] Wire up Supabase auth (signInWithPassword, signUp)
- [x] Add PayPal subscription button for member plan
- [x] Create onboarding page with 5 steps
- [x] Step 1: Welcome screen
- [x] Step 2: Your Situation (4 selectable cards)
- [x] Step 3: Your Budget (income/expense inputs with live calculations)
- [x] Step 4: Your Goals (3 selectable cards, child age/target inputs)
- [x] Step 5: Your First Pick (personalized recommendation)
- [x] Save progress to profiles.onboarding_step
- [x] Mark onboarding_completed on finish

## Acceptance
- Auth modal opens, sign in/up works
- Onboarding completes and redirects to dashboard
- Admin users redirect to /admin, members to /app/dashboard
