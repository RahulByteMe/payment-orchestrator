import crypto from "crypto";
import { BaseGateway } from "./base.gateway.js";

export class MockGateway extends BaseGateway {
  constructor({ failRate = 0 } = {}) {
    super("mock");
    this.failRate = failRate;
  }

  async createPayment({ amount, currency, orderRef }) {
    if (Math.random() < this.failRate) {
      throw new Error("MOCK_GATEWAY_FAILURE");
    }
    return {
      gatewayOrderId: "mock_" + crypto.randomUUID(),
      checkoutUrl: `http://localhost:3000/mock-checkout/${orderRef}`,
      amount,
      currency,
    };
  }
}
