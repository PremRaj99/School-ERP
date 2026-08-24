import { z, type ZodTypeAny } from 'zod';

/**
 * One `RouteDef` per API operation. `backend/src/core/http/defineRoute.ts` consumes it to validate
 * the incoming request and the outgoing response; `frontend/src/lib/api/typed-client.ts` consumes
 * the exact same object to build the request and type the result. Neither side redeclares anything.
 */
export interface RouteDef<
  Params extends ZodTypeAny | undefined = ZodTypeAny | undefined,
  Query extends ZodTypeAny | undefined = ZodTypeAny | undefined,
  Body extends ZodTypeAny | undefined = ZodTypeAny | undefined,
  Response extends ZodTypeAny = ZodTypeAny,
> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Express-style path, relative to `/api/v1` — e.g. `/admin/student/:studentId`. */
  path: string;
  params?: Params;
  query?: Query;
  body?: Body;
  response: Response;
  /**
   * HTTP status on success. Defaults to 200 for GET and 200 for everything else — set this
   * explicitly to match this codebase's per-endpoint convention (e.g. 201 for a create, 202 for
   * an accepted update/delete) rather than trying to guess it from the verb: several existing POST
   * routes here are 202, not 201, so "POST always means 201" would be wrong more often than right.
   */
  successStatus?: number;
  /** Short human description, surfaced in generated docs. Optional but encouraged. */
  summary?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRouteDef = RouteDef<any, any, any, any>;

/** Identity helper — exists purely so a group of routes gets inferred as a literal, checked shape. */
export const defineContract = <T extends Record<string, AnyRouteDef>>(group: T): T => group;

export interface ApiSuccessEnvelope<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorIssue {
  path: string;
  message: string;
}

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  code: string;
  issues?: ApiErrorIssue[];
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export const isApiError = (body: unknown): body is ApiErrorEnvelope =>
  typeof body === 'object' && body !== null && (body as { success?: unknown }).success === false;

/** Infers the request/response types a `RouteDef` describes — used by both client and server. */
export type InferParams<R extends AnyRouteDef> = R['params'] extends ZodTypeAny
  ? z.infer<R['params']>
  : undefined;
export type InferQuery<R extends AnyRouteDef> = R['query'] extends ZodTypeAny
  ? z.infer<R['query']>
  : undefined;
export type InferBody<R extends AnyRouteDef> = R['body'] extends ZodTypeAny
  ? z.infer<R['body']>
  : undefined;
export type InferResponse<R extends AnyRouteDef> = z.infer<R['response']>;
