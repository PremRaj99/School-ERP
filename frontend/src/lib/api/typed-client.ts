import type {
  AnyRouteDef,
  InferBody,
  InferParams,
  InferQuery,
  InferResponse,
} from '@schoolerp/contracts';
import { apiClient } from '../api';

const buildPath = (path: string, params: Record<string, string> | undefined): string => {
  if (!params) return path;
  return path.replace(/:([a-zA-Z0-9_]+)/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing path param "${key}" for route "${path}"`);
    }
    return encodeURIComponent(value);
  });
};

export interface ApiOptions<R extends AnyRouteDef> {
  params?: InferParams<R>;
  query?: InferQuery<R>;
  body?: InferBody<R>;
}

/**
 * The one function every contract-driven frontend call goes through. `route` is one of the
 * `*Contract` objects exported by `@schoolerp/contracts` (e.g. `adminStudentContract.create`) —
 * the same object the backend's `defineRoute` validated the request/response against, so the
 * params/query/body/response shapes here can never drift from what the server actually does.
 */
export async function api<R extends AnyRouteDef>(
  route: R,
  opts?: ApiOptions<R>,
): Promise<InferResponse<R>> {
  const url = buildPath(route.path, opts?.params as Record<string, string> | undefined);

  const res = await apiClient.request<{ data: InferResponse<R> }>({
    url,
    method: route.method,
    params: opts?.query,
    data: opts?.body,
  });

  return res.data.data;
}
