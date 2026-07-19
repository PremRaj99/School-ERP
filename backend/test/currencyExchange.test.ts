import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import axios from 'axios';
import { currencyExchange } from '../src/modules/billing/currencyExchange.service';
import { ValidationError } from '../src/core/errors/ApiError';

describe.skip('CurrencyExchange Service', () => {
  const originalGet = axios.get;

  test.afterEach(() => {
    axios.get = originalGet;
  });

  describe('getINRtoUSD', () => {
    it('should return correct converted rate on success', async () => {
      (axios.get as unknown) = async (url: string) => {
        assert.ok(url.includes('api.currencyfreaks.com'));
        return {
          data: {
            rates: {
              INR: '80',
            },
          },
        } as Awaited<ReturnType<typeof originalGet>>;
      };

      const result = await currencyExchange.getINRtoUSD();
      assert.strictEqual(result, 1 / 80);
    });

    it('should throw ValidationError if axios request fails', async () => {
      axios.get = async () => {
        throw new Error('Network error');
      };

      await assert.rejects(
        async () => {
          await currencyExchange.getINRtoUSD();
        },
        (err: unknown) => {
          assert.ok(err instanceof ValidationError);
          assert.strictEqual(err.message, 'Failed to fetch currency exchange rate');
          return true;
        },
      );
    });

    it('should throw ValidationError if response is malformed', async () => {
      (axios.get as unknown) = async () => {
        return { data: {} } as Awaited<ReturnType<typeof originalGet>>;
      };

      await assert.rejects(
        async () => {
          await currencyExchange.getINRtoUSD();
        },
        (err: unknown) => {
          assert.ok(err instanceof ValidationError);
          assert.strictEqual(err.message, 'Currency exchange rate not found');
          return true;
        },
      );
    });
  });

  describe('getUSDtoINR', () => {
    it('should return INR rate on success', async () => {
      (axios.get as unknown) = async () => {
        return {
          data: {
            rates: {
              INR: '83.5',
            },
          },
        } as Awaited<ReturnType<typeof originalGet>>;
      };

      const result = await currencyExchange.getUSDtoINR();
      assert.strictEqual(result, 83.5);
    });

    it('should throw ValidationError if axios request fails', async () => {
      axios.get = async () => {
        throw new Error('Network error');
      };

      await assert.rejects(
        async () => {
          await currencyExchange.getUSDtoINR();
        },
        (err: unknown) => {
          assert.ok(err instanceof ValidationError);
          assert.strictEqual(err.message, 'Failed to fetch currency exchange rate');
          return true;
        },
      );
    });

    it('should throw ValidationError if rate not found', async () => {
      (axios.get as unknown) = async () => {
        return { data: { rates: {} } } as Awaited<ReturnType<typeof originalGet>>;
      };

      await assert.rejects(
        async () => {
          await currencyExchange.getUSDtoINR();
        },
        (err: unknown) => {
          assert.ok(err instanceof ValidationError);
          assert.strictEqual(err.message, 'Currency exchange rate not found');
          return true;
        },
      );
    });
  });
});
