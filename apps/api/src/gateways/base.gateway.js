/**
 * Every payment gateway adapter must extend this class.
 * Routing and business logic only talk to this interface.
 */
export class BaseGateway {
  constructor(name) {
    this.name = name;
  }

  async createPayment(input) {
    throw new Error("createPayment() not implemented");
  }
  verifyWebhook(headers, rawBody) {
    throw new Error("verifyWebhook() not implemented");
  }
  parseWebhook(rawBody) {
    throw new Error("parseWebhook() not implemented");
  }
  async getStatus(gatewayOrderId) {
    throw new Error("getStatus() not implemented");
  }
  async refund(paymentId, amount) {
    throw new Error("refund() not implemented");
  }
}
