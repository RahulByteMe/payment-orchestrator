# FailoverPay: Product Requirements Document

| | |
|---|---|
| **Version** | 0.1 (draft) |
| **Author** | <your name> |
| **Status** | In development |

## 1. Overview

FailoverPay is a payment orchestration service. It exposes one unified API to merchant websites and connects to multiple payment gateways behind the scenes, so a website integrates once and can use any supported gateway.

## 2. Problem Statement

- Each gateway has its own API, webhook format, and signature scheme.
- Every website must integrate and maintain each gateway separately.
- Adding or replacing a gateway means touching every website.
- If one gateway goes down, payments fail with no automatic fallback.
- Webhook handling, retries, and idempotency get re-implemented again and again.

## 3. Goals

1. One integration per website, regardless of the number of gateways.
2. Add a new gateway by writing a single adapter, with zero change to websites.
3. Keep payments working when one gateway fails (failover).
4. Never double-charge or lose a payment event.
5. Give a single view of all transactions across websites and gateways.

## 4. Non-Goals

- Acting as a licensed Payment Aggregator or holding merchant funds.
- Storing or processing raw card data.
- Building a new payment gateway.
- Supporting every gateway in the market (the target is 2 real gateways plus a mock).

## 5. Users

| User | Need |
|---|---|
| **Merchant developer** | Simple API/SDK to accept payments in a few lines |
| **Platform admin (owner)** | Dashboard to monitor payments, manage gateways, see failures |

## 6. Functional Requirements

### 6.1 Merchant management
- FR-1: Admin can create a merchant (website) and receive an API key.
- FR-2: API keys are stored hashed and can be rotated.
- FR-3: Each merchant can configure a callback webhook URL.

### 6.2 Payments
- FR-4: `POST /v1/payments` creates a payment and returns a checkout URL.
- FR-5: Requests require an `Idempotency-Key`. The same key returns the same response.
- FR-6: `GET /v1/payments/:id` returns the current status.
- FR-7: Payments follow a strict state machine; invalid transitions are rejected.
- FR-8: Amounts are stored as integers in paise.

### 6.3 Gateways
- FR-9: Every gateway implements a common interface (create, verify webhook, parse webhook, status, refund).
- FR-10: Supported gateways at launch: Razorpay (test), Cashfree (sandbox), Mock.
- FR-11: Gateways can be enabled/disabled and prioritized by an admin.

### 6.4 Webhooks
- FR-12: Incoming gateway webhooks have their signature verified against the raw body.
- FR-13: Duplicate events (same gateway + event id) are ignored.
- FR-14: Events are processed asynchronously through a queue.
- FR-15: Merchants receive a signed callback with exponential-backoff retries.

### 6.5 Routing and failover
- FR-16: Routing rules can depend on payment method (e.g. UPI vs card).
- FR-17: On gateway error or timeout, retry on the next gateway.
- FR-18: Circuit breaker pauses a gateway after repeated failures.
- FR-19: Every attempt is logged with gateway, status, error code, and latency.

### 6.6 Refunds and reconciliation
- FR-20: Full and partial refunds via API.
- FR-21: Scheduled job compares gateway records with the local ledger and flags mismatches.
- FR-22: Stuck PENDING payments are re-checked via the gateway status API.

### 6.7 Dashboard
- FR-23: Admin login.
- FR-24: Transactions list with filters (website, status, gateway, date).
- FR-25: Charts for gateway success rate, revenue per website, failure reasons.
- FR-26: Alerts (email/Telegram) on gateway downtime.

### 6.8 SDK
- FR-27: `failoverpay-sdk` npm package wrapping the API.

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Security** | Hashed API keys, constant-time webhook signature checks, secrets only in env vars, input validation on every endpoint, no card data stored |
| **Reliability** | No duplicate charges; no lost webhook events; graceful handling of gateway timeouts |
| **Performance** | Targets to be set after load testing (record p95 latency and req/s) |
| **Observability** | Structured logs, per-attempt records, health endpoint |
| **Maintainability** | Layered code (route → controller → service → gateway), adapter contract tests |

## 8. Data Model (summary)

`Merchant`, `Payment`, `PaymentAttempt`, `WebhookEvent`, `Refund`. See `apps/api/prisma/schema.prisma`.

## 9. API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/v1/payments` | Create payment |
| GET | `/v1/payments/:id` | Get payment status |
| POST | `/v1/payments/:id/refund` | Refund |
| POST | `/v1/webhooks/:gateway` | Gateway webhook receiver |
| GET | `/v1/admin/stats` | Dashboard statistics |
| GET | `/health` | Health check |

## 10. Success Metrics

| Metric | Target |
|---|---|
| Websites integrated | At least 1 demo shop + 1 real site |
| Gateways supported | 2 real + 1 mock |
| Failover recovery on simulated failures | Measure and record |
| Duplicate charges under retry tests | 0 |
| Test coverage | Measure and record |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Gateway sandboxes behave differently from production | Contract tests; document limitations |
| Regulatory exposure (RBI PA licence) | Routing-layer design, funds settle directly to merchants; sandbox only |
| Scope too large | Strict phase order; MVP is one gateway + one website |

## 12. Out of Scope for v1

Subscriptions/recurring billing, multi-currency FX, payouts, fraud detection, mobile SDKs.

## 13. Milestones

See [ROADMAP.md](ROADMAP.md).
