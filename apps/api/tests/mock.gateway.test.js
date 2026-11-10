import { describe, it, expect } from "vitest";
import { MockGateway } from "../src/gateways/mock.gateway.js";

describe("MockGateway", () => {
  it("creates a payment when failRate is 0", async () => {
    const gw = new MockGateway({ failRate: 0 });
    const res = await gw.createPayment({ amount: 49900, currency: "INR", orderRef: "o1" });
    expect(res.gatewayOrderId).toMatch(/^mock_/);
  });

  it("always fails when failRate is 1", async () => {
    const gw = new MockGateway({ failRate: 1 });
    await expect(
      gw.createPayment({ amount: 100, currency: "INR", orderRef: "o2" })
    ).rejects.toThrow("MOCK_GATEWAY_FAILURE");
  });
});
