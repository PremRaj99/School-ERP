import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { SelectField } from './TextFields';
import { useSessionOptions } from '@/hooks/options/useAdminOptions';

/** `SelectField` pre-wired to the generated session options — one line at every call site instead
 *  of importing `useSessionOptions` separately everywhere a session picker is needed. */
export function SessionField<TValues extends FieldValues>({
  control,
  name,
  label = 'Session',
  required = true,
  disabled,
  className,
}: {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const options = useSessionOptions();
  return (
    <SelectField
      control={control}
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
      options={options}
      placeholder="Select session…"
    />
  );
}
