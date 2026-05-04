---
title: Member App (8 Pages)
status: done
priority: high
type: feature
tags: [frontend, member-app]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 4
---

## Notes
Build 8 authenticated member pages: Dashboard with stats and featured picks, Picks with filter tabs and price updates, Watchlist with tabs and news feed, Budget calculator with expense bars, College Fund with projections and chart, Brokers with affiliate tracking, Guides with QR codes, Get App with PWA install instructions.

## Checklist
- [x] Dashboard page with morning brief, stat cards, featured picks, college snapshot, weekly tip
- [x] Picks page with All/ETFs/Stocks/Bonds filter tabs, pick cards with live prices, compounding boxes, AI rationale
- [x] Watchlist page with ETFs/Stocks/College tabs, news feed with sentiment, allocation donut chart
- [x] Budget page with income/expense inputs, animated bar chart, college fund and investing budget highlights
- [x] College Fund page with 4 range sliders, projection card, line chart, recommended portfolio
- [x] Brokers page with 6 broker cards and affiliate click logging
- [x] Guides page with PDF products from Supabase, QR codes, 20% member discount badge
- [x] Get App page with QR code, copy link button, install instructions for iOS/Android/Mac/Windows

## Acceptance
- All 8 pages render with AppLayout
- Pages fetch real data from Supabase
- Live price updates every 60 seconds
- Charts display correctly using Chart.js
