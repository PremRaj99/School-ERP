import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { FieldShell } from './FieldShell';
import type { Option } from '@/hooks/options/useAdminOptions';

interface SearchableSelectFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  options: Option[];
  required?: boolean;
  description?: string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * `SelectField` with type-to-search: typing filters the options by their label (e.g. a student's
 * name, roll number or ID), and the form still receives the option's `value`. Use it instead of
 * `SelectField` for long lists like students or teachers.
 */
export function SearchableSelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  required,
  description,
  placeholder = 'Type to search…',
  emptyText = 'No matches found.',
  disabled,
  className,
}: SearchableSelectFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = options.find((opt) => opt.value === field.value) ?? null;
        return (
          <FieldShell
            htmlFor={name}
            label={label}
            required={required}
            description={description}
            error={fieldState.error}
          >
            <Combobox
              items={options}
              value={selected}
              onValueChange={(opt: Option | null) => field.onChange(opt?.value ?? '')}
              itemToStringLabel={(opt: Option) => opt.label}
              isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
              disabled={disabled}
              autoHighlight
            >
              <ComboboxInput
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                showClear={!!selected}
                onBlur={field.onBlur}
                aria-invalid={!!fieldState.error}
                className={className ?? 'w-full'}
              />
              <ComboboxContent>
                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                <ComboboxList>
                  {(opt: Option) => (
                    <ComboboxItem key={opt.value} value={opt}>
                      {opt.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </FieldShell>
        );
      }}
    />
  );
}
