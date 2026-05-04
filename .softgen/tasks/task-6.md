---
title: API Routes & Integrations
status: todo
priority: high
type: feature
tags: [backend, api]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 6
---

## Notes
7 API routes for prices (Finnhub), news (Finnhub), history (Twelve Data), Claude analysis, PayPal webhook, QR generation.

## Checklist
- [ ] Create /api/prices (Finnhub integration with 60s cache)
- [ ] Create /api/news (Finnhub company news with sentiment)
- [ ] Create /api/history (Twelve Data historical returns)
- [ ] Create /api/claude/analyze (Claude AI investment analysis)
- [ ] Create /api/paypal/webhook (PayPal subscription events)
- [ ] Create /api/qr (QR code SVG generation)
- [ ] Install qrcode npm package

## Acceptance
- All API routes return correct data
- Price cache works (60s staleness check)
- PayPal webhook handles subscription events correctly
- Claude API generates investment analysis
