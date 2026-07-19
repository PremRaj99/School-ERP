import { describe, it } from 'node:test';
import assert from 'node:assert';
import { phonePeService } from '../src/modules/payment/phonePe.service';

describe('PhonePeService Sandbox Integration Test', () => {
  it('should successfully initiate a payment request and check its status on PhonePe Sandbox', async () => {
    const txnId = `txn-${Date.now()}`;
    const orderId = `order-${Date.now()}`;
    const amount = 10; // ₹10.00 (which will map to 1000 paise in the service)

    // 1. Initiate Request
    const payResponse = await phonePeService.InitiateRequest(txnId, amount, orderId);

    assert.ok(payResponse, 'Response from InitiateRequest should be truthy');
    assert.strictEqual(
      payResponse.merchantOrderId,
      orderId,
      'Returned order ID should match inputs',
    );

    // Validate checkout redirect properties from PhonePe SDK pay response
    console.log('payResponse', payResponse.redirectUrl);
    assert.ok(payResponse.redirectUrl, 'Redirect URL should be returned by PhonePe Sandbox');
    assert.ok(
      payResponse.redirectUrl.includes('merchants.phonepe.com') ||
        payResponse.redirectUrl.includes('phonepe.com'),
      'URL should point to PhonePe host',
    );

    // 2. Immediately Confirm Payment Status
    const statusResponse = await phonePeService.ConfirmPaymentStatus(orderId);

    assert.ok(statusResponse, 'Response from ConfirmPaymentStatus should be truthy');
    assert.ok(statusResponse.state, 'Response should contain standard PhonePe order status state');
  });

  it('should return an empty string when querying a non-existent or malformed order ID', async () => {
    const response = await phonePeService.ConfirmPaymentStatus('completely-invalid-id-12345');
    assert.strictEqual(
      response,
      '',
      'ConfirmPaymentStatus should return empty string for non-existent order',
    );
  });
});
