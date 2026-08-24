import { NextFunction, Request, RequestHandler, Response } from 'express';
import type {
  AnyRouteDef,
  InferBody,
  InferParams,
  InferQuery,
  InferResponse,
} from '@schoolerp/contracts';
import { validateSchema } from '@/core/errors';
import { asyncHandler } from '@/core/responses';

export interface RouteHandlerArgs<R extends AnyRouteDef> {
  params: InferParams<R>;
  query: InferQuery<R>;
  body: InferBody<R>;
  /** Undefined on public routes (no `verifyJWT` in front of this route). */
  user: { id: string; role: string } | undefined;
  req: Request;
  res: Response;
}

const defaultMessageFor = (statusCode: number): string => {
  if (statusCode === 201) return 'created';
  if (statusCode === 202) return 'accepted';
  return 'ok';
};

/**
 * Wraps one contract-defined operation end to end:
 *  1. validates `req.params` / `req.query` / `req.body` against the contract's schemas (a bad
 *     request throws `ValidationError` → 400, same as the existing `validateSchema` call sites),
 *  2. runs `handler` with those typed, already-validated values,
 *  3. validates the handler's return value against `route.response` — if a service drifts from
 *     the contract this throws here (logged, 500'd) instead of silently shipping the wrong shape,
 *  4. sends `{ success: true, statusCode, message, data }` — the same envelope shape
 *     `core/responses/ApiResponse.ts` already produces — at `route.successStatus` (default 200).
 *
 * `route.path` is not used for Express registration here — the route file still does
 * `router.get('/:studentId', getStudentDetail)` as before. `path` exists so the frontend's typed
 * client (and, later, generated docs) can build the same request from the same object.
 */
export const defineRoute = <R extends AnyRouteDef>(
  route: R,
  handler: (args: RouteHandlerArgs<R>) => Promise<InferResponse<R>>,
): RequestHandler =>
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const params = (
      route.params ? validateSchema(route.params, req.params) : undefined
    ) as InferParams<R>;
    const query = (
      route.query ? validateSchema(route.query, req.query) : undefined
    ) as InferQuery<R>;
    const body = (route.body ? validateSchema(route.body, req.body) : undefined) as InferBody<R>;

    const result = await handler({ params, query, body, user: req.user, req, res });

    // Response-contract violation is a server bug, not a client error — let it throw a plain
    // ZodError so errorHandlerMiddleware's generic 500 path takes it, not the 400 ValidationError
    // path. The full issue list still lands in the error log via `err.stack`.
    const data = route.response.parse(result);

    const statusCode = route.successStatus ?? 200;
    res.status(statusCode).json({
      success: true,
      statusCode,
      message: defaultMessageFor(statusCode),
      data,
    });
  });
