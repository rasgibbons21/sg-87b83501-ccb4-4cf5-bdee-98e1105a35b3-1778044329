---
title: Database Setup & Schema
status: in_progress
priority: urgent
type: feature
tags: [database, supabase, backend]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 1
---

## Notes
Create complete database schema for Bloom investment platform. 10 tables with RLS policies, auto-create profile trigger, seed data for picks/testimonials/products.

## Checklist
- [ ] Create profiles table extending auth.users with trigger
- [ ] Create subscriptions table
- [ ] Create picks table with 9 seeded picks
- [ ] Create watchlist table
- [ ] Create journal table
- [ ] Create testimonials table with 3 seeded entries
- [ ] Create pdf_products table with 6 seeded products
- [ ] Create affiliate_clicks table
- [ ] Create admin_settings table
- [ ] Create price_cache table
- [ ] Set up all RLS policies per table requirements

## Acceptance
- All 10 tables exist with proper columns and constraints
- RLS policies enforce user/admin access rules
- Seed data visible in Supabase dashboard
