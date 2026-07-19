import { describe, it } from 'node:test';
import assert from 'node:assert';
import { openRouterService } from '../src/modules/billing/openRouter.service';

describe.skip('OpenRouterService Integration Test', () => {
  it('should create, retrieve, and then delete a real API key on OpenRouter', async () => {
    const keyName = `test-key-${Date.now()}`;

    // 1. Create a key with a small limit ($0.01)
    const createdKey = await openRouterService.createAPIKey(keyName, 0.01);
    assert.ok(createdKey.key, 'Created key string should be returned');
    assert.ok(createdKey.hash, 'Created key hash should be returned');

    // 2. Fetch key details to verify it exists
    const fetchedKey = await openRouterService.getKey(createdKey.hash);
    assert.strictEqual(fetchedKey.name, keyName, 'Fetched key name should match the created name');
    assert.strictEqual(fetchedKey.limit, 0.01, 'Fetched key limit should match $0.01');

    // 3. Clean up (delete the key)
    const deletionResult = await openRouterService.deleteKey(createdKey.key);
    assert.strictEqual(deletionResult, true, 'deleteKey should return true');
  });
});
