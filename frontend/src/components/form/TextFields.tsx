import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { FieldShell } from './FieldShell';
import type { Option } from '@/hooks/options/useAdminOptions';

interface BaseFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TextField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  multiline,
}: BaseFieldProps<TValues> & { multiline?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          htmlFor={name}
          label={label}
          required={required}
          description={description}
          error={fieldState.error}
        >
          {multiline ? (
            <Textarea
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              aria-invalid={!!fieldState.error}
              {...field}
              value={field.value ?? ''}
            />
          ) : (
            <Input
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              aria-invalid={!!fieldState.error}
              {...field}
              value={field.value ?? ''}
            />
          )}
        </FieldShell>
      )}
    />
  );
}

export function NumberField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  min,
  max,
  step,
  currency,
}: BaseFieldProps<TValues> & { min?: number; max?: number; step?: number; currency?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          htmlFor={name}
          label={label}
          required={required}
          description={description}
          error={fieldState.error}
        >
          <div className="relative">
            {currency && (
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs">
                ₹
              </span>
            )}
            <Input
              id={name}
              type="number"
              min={min}
              max={max}
              step={step}
              placeholder={placeholder}
              disabled={disabled}
              className={currency ? `pl-6 ${className ?? ''}` : className}
              aria-invalid={!!fieldState.error}
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
              }
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </div>
        </FieldShell>
      )}
    />
  );
}

export function DateField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  disabled,
  className,
}: BaseFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          htmlFor={name}
          label={label}
          required={required}
          description={description}
          error={fieldState.error}
        >
          <Input
            id={name}
            type="date"
            disabled={disabled}
            className={className}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ''}
          />
        </FieldShell>
      )}
    />
  );
}

export function MonthField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  disabled,
  className,
}: BaseFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          htmlFor={name}
          label={label}
          required={required}
          description={description}
          error={fieldState.error}
        >
          <Input
            id={name}
            type="month"
            disabled={disabled}
            className={className}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ''}
          />
        </FieldShell>
      )}
    />
  );
}

export function SelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  disabled,
  className,
  options,
  placeholder = 'Select…',
}: BaseFieldProps<TValues> & { options: Option[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldShell
          htmlFor={name}
          label={label}
          required={required}
          description={description}
          error={fieldState.error}
        >
          <NativeSelect
            id={name}
            disabled={disabled}
            className={className}
            aria-invalid={!!fieldState.error}
            {...field}
            value={field.value ?? ''}
          >
            <NativeSelectOption value="" disabled>
              {placeholder}
            </NativeSelectOption>
            {options.map((opt) => (
              <NativeSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FieldShell>
      )}
    />
  );
}
