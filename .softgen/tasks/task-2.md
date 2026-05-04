---
title: Design System & Landing Page
status: done
priority: high
type: feature
tags: [frontend, design, landing]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 2
---

## Notes
Implement sage/terracotta/champagne color system, Cormorant Garamond + DM Sans + JetBrains Mono fonts. Build landing page with hero, calculator, testimonials, PDF guides, brokers, pricing sections. Live crawler ticker.

## Checklist
- [x] Set up color tokens in globals.css (sage-800 through sage-50, terracotta, champagne, ivory background)
- [x] Import Google Fonts (Cormorant Garamond, DM Sans, JetBrains Mono)
- [x] Register fonts in tailwind.config.ts
- [x] Create crawler ticker component (live prices, 55s scroll animation)
- [x] Build landing page header with logo and navigation
- [x] Build hero section (two-column with preview dashboard card)
- [x] Build $50/month calculator with live FV calculations
- [x] Build testimonials grid (3 cards from Supabase)
- [x] Build PDF guides grid with QR codes
- [x] Build brokers section (6 cards with affiliate links)
- [x] Build pricing section (2 plans)
- [x] Build footer

## Acceptance
- Landing page loads with complete design system
- Calculator updates live as inputs change
- Testimonials and PDF products load from Supabase
