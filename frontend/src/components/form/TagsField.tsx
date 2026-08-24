import { useState } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FieldShell } from './FieldShell';

/**
 * A free-text chip/tag multi-value input — for `Teacher.subjectHandled`, which is still a bare
 * `string[]` on the wire (ALIGNMENT_PLAN.md 2D/D1 — turning it into a real `Subject` relation so it
 * could use `<MultiSelectField>` against real subject codes is a schema change, not done). This is
 * still a real upgrade over one raw comma-separated text input: type a subject, press Enter or
 * comma to add it as a chip, click a chip's × to remove it.
 */
export function TagsField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  disabled,
  placeholder = 'Type a value and press Enter…',
}: {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : [];

        const commit = () => {
          const trimmed = draft.trim();
          if (trimmed && !values.includes(trimmed)) {
            field.onChange([...values, trimmed]);
          }
          setDraft('');
        };

        const remove = (value: string) => {
          field.onChange(values.filter((v) => v !== value));
        };

        return (
          <FieldShell
            htmlFor={name}
            label={label}
            required={required}
            description={description}
            error={fieldState.error}
          >
            <div className="border-input flex min-h-9 flex-wrap items-center gap-1.5 rounded-none border px-2 py-1.5">
              {values.map((value) => (
                <Badge key={value} variant="secondary" className="gap-1 text-[10px] font-medium">
                  {value}
                  <button
                    type="button"
                    onClick={() => remove(value)}
                    disabled={disabled}
                    className="hover:text-destructive"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
              <Input
                id={name}
                value={draft}
                disabled={disabled}
                placeholder={values.length === 0 ? placeholder : undefined}
                aria-invalid={!!fieldState.error}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  commit();
                  field.onBlur();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    commit();
                  } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
                    remove(values[values.length - 1]);
                  }
                }}
                className="h-6 flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </FieldShell>
        );
      }}
    />
  );
}
