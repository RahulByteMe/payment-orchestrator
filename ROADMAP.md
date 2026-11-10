# FailoverPay Roadmap

Tick the boxes as you finish items. Tag a release at the end of each phase.

| Phase | Focus | Duration | Tag |
|---|---|---|---|
| 0 | Setup | 2 days | v0.0.1 |
| 1 | Single gateway MVP | Week 1 | v0.1.0 |
| 2 | Webhooks + idempotency | Week 2 | v0.2.0 |
| 3 | Second gateway + mock | Week 3 | v0.3.0 |
| 4 | Routing + failover | Week 4 | v0.4.0 |
| 5 | Ledger, refunds, reconciliation | Week 5 | v0.5.0 |
| 6 | Dashboard | Week 6 | v0.6.0 |
| 7 | SDK + demo shop | Week 7 | v0.7.0 |
| 8 | Polish and deploy | Week 8 | v1.0.0 |

---

## Phase 0: Setup
- [ ] Create GitHub repo, add MIT license and `.gitignore`
- [ ] Init Express project in `apps/api`
- [ ] `docker-compose.yml` with Postgres and Redis
- [ ] Prisma schema and first migration
- [ ] `GET /health` endpoint and one Supertest test
- [ ] ESLint, Prettier, pre-commit hook
- [ ] GitHub Actions: lint and test on every push
- [ ] README problem statement and architecture diagram

**Done when:** `docker compose up -d` and `npm run dev` give a working `/health`.

## Phase 1: Single gateway MVP
- [ ] Merchant model and API-key auth middleware (hashed keys)
- [ ] `BaseGateway` class and `MockGateway`
- [ ] Razorpay adapter (create order, status), test mode
- [ ] `POST /v1/payments` with Zod validation
- [ ] `GET /v1/payments/:id`
- [ ] Save payment and attempt records
- [ ] Swagger docs

**Done when:** a payment created from Postman opens the Razorpay test checkout.

## Phase 2: Webhooks and idempotency
- [ ] Webhook endpoint using the raw body
- [ ] Signature verification (constant-time compare)
- [ ] `WebhookEvent` unique constraint to drop duplicates
- [ ] BullMQ queue and worker for event processing
- [ ] Idempotency-Key middleware
- [ ] Payment state machine (reject invalid and out-of-order transitions)
- [ ] Signed callbacks to merchant URL with exponential-backoff retries

**Done when:** completing a payment updates its status automatically and notifies the merchant.

## Phase 3: Second gateway and mock
- [ ] Cashfree adapter (sandbox)
- [ ] Mock gateway modes: always succeed, random fail, timeout, slow
- [ ] Gateway registry/factory
- [ ] Shared contract tests that every adapter must pass

**Done when:** switching gateway needs no change on the merchant side.

## Phase 4: Routing and failover
- [ ] Rule-based routing (by payment method, amount, merchant)
- [ ] Failover to next gateway on error or timeout
- [ ] Circuit breaker
- [ ] Per-attempt logging (latency, error code)
- [ ] Success-rate-based routing over last N attempts
- [ ] Failover test: simulate 100 failures with the mock gateway and record the recovery rate

**Done when:** disabling one gateway still lets payments succeed.

## Phase 5: Ledger, refunds, reconciliation
- [ ] Refund API (full and partial) and refund webhooks
- [ ] Reconciliation cron job with mismatch flags
- [ ] Re-check stuck PENDING payments via status API
- [ ] Per-merchant rate limiting
- [ ] Audit logs

## Phase 6: Dashboard
- [ ] Admin login
- [ ] Transactions table with filters
- [ ] Charts: gateway success rate, revenue per website, failure reasons
- [ ] Gateway enable/disable and priority controls
- [ ] Alerts via Telegram or email

## Phase 7: SDK and demo shop
- [ ] `failoverpay-sdk` npm package
- [ ] `examples/demo-shop` using the SDK
- [ ] Connect one of your real websites to FailoverPay

## Phase 8: Polish and deploy
- [ ] Load test (k6 or autocannon): record req/s and p95 latency
- [ ] Unit and integration tests, coverage badge
- [ ] Mermaid architecture and sequence diagrams (payment flow, failover flow)
- [ ] Deploy (Railway, Render, or VPS) and add live demo link
- [ ] 2-3 minute demo video or GIF in README
- [ ] 3-4 ADRs in `docs/decisions/` (why BullMQ, why adapter pattern, why idempotency keys)
- [ ] Fill in the benchmarks table in README

---

## Git workflow

- `main` is always stable; work in `feat/<name>` branches, one per phase
- Conventional commits: `feat(gateway): add cashfree adapter`, `fix(webhook): ignore duplicate events`
- Small, regular commits; merge via pull request even if you work alone
- Tag each phase: `git tag v0.1.0 && git push --tags`

## Future ideas (post v1.0)

- More gateways (Stripe, PayU)
- Subscriptions / recurring payments
- Payment links
- TypeScript migration
- Fraud-rule engine
- Multi-currency support
