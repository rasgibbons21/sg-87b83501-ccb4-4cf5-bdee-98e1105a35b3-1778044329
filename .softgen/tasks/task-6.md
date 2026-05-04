---
title: API Routes & Integrations
status: done
priority: high
type: feature
tags: [backend, api]
created_by: agent
created_at: 2026-05-04T13:52:27Z
position: 6
---

## Notes
Create API routes for prices (Finnhub with cache), news (Finnhub), history (Twelve Data), Claude analysis, PayPal webhook, and QR code generation.

## Checklist
- [x] /api/qr - Generate QR codes using qrcode package
- [x] /api/prices - Fetch live prices from Finnhub with 60s cache
- [x] /api/news - Fetch company news with sentiment analysis
- [x] /api/history - Fetch historical returns from Twelve Data
- [x] /api/claude/analyze - Generate AI investment analysis (admin only)
- [x] /api/paypal/webhook - Handle PayPal subscription events

## Acceptance
- QR codes generate correctly for PDF products and Get App page
- Live prices update every 60 seconds via cache
- News sentiment displays (positive/negative/neutral)
- Claude generates investment rationale on demand
- PayPal webhook handles subscription events correctly
- Claude API generates investment analysis
