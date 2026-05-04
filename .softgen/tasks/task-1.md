---
title: Database Setup & Schema
status: done
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
- [x] Create profiles table extending auth.users with trigger
- [x] Create subscriptions table
- [x] Create picks table with 9 seeded picks
- [x] Create watchlist table
- [x] Create journal table
- [x] Create testimonials table with 3 seeded entries
- [x] Create pdf_products table with 6 seeded products
- [x] Create affiliate_clicks table
- [x] Create admin_settings table
- [x] Create price_cache table
- [x] Set up all RLS policies per table requirements

## Acceptance
- All 10 tables exist with proper columns and constraints
- RLS policies enforce user/admin access rules
- Seed data visible in Supabase dashboard
