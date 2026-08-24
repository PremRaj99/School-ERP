import type { ReactNode } from 'react';
import type { FieldError as RHFFieldError } from 'react-hook-form';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

/**
 * The label/description/error shell every field in `components/form/*` shares — built on shadcn's
 * `Field`/`FieldLabel`/`FieldError` primitives (`components/ui/field.tsx`) rather than reinventing
 * that layout per field type.
 */
export function FieldShell({
  htmlFor,
  label,
  required,
  description,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: RHFFieldError;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </FieldLabel>
      <FieldContent>
        {children}
        {description && !error && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={error ? [error] : undefined} />
      </FieldContent>
    </Field>
  );
}
