import { z, ZodTypeAny } from 'zod';
import { ValidationError } from './ApiError';

export const validateSchema = <T extends ZodTypeAny>(Schema: T, data: unknown): z.infer<T> => {
  const parseResult = Schema.safeParse(data);

  if (!parseResult.success) {
    const issues = parseResult.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    const firstIssue = parseResult.error.issues[0];
    throw new ValidationError(firstIssue ? firstIssue.message : 'Validation error', issues);
  }
  return parseResult.data;
};
