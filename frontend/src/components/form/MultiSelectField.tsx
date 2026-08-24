import { useState } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { PiCheck, PiCaretDown, PiX } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { FieldShell } from './FieldShell';
import type { Option } from '@/hooks/options/useAdminOptions';

/**
 * A checkable, searchable multi-select — for anything that's genuinely "pick several from a known
 * list" (a teacher's subjects, a filter's set of statuses) rather than free text with commas
 * (ALIGNMENT_PLAN.md Part 3.2). Built on the existing Popover + cmdk `Command` primitives rather
 * than a new dependency.
 */
export function MultiSelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  disabled,
  options,
  placeholder = 'Select…',
  emptyText = 'No matches.',
}: {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  options: Option[];
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];

        const toggle = (value: string) => {
          if (selected.includes(value)) {
            field.onChange(selected.filter((v) => v !== value));
          } else {
            field.onChange([...selected, value]);
          }
        };

        const remove = (value: string) => {
          field.onChange(selected.filter((v) => v !== value));
        };

        const labelFor = (value: string) => options.find((o) => o.value === value)?.label ?? value;

        return (
          <FieldShell
            htmlFor={name}
            label={label}
            required={required}
            description={description}
            error={fieldState.error}
          >
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id={name}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={!!fieldState.error}
                    className="h-auto min-h-8 w-full justify-between px-2.5 py-1.5 text-xs font-normal"
                  />
                }
              >
                <span className="flex flex-1 flex-wrap items-center gap-1">
                  {selected.length === 0 ? (
                    <span className="text-muted-foreground">{placeholder}</span>
                  ) : (
                    selected.map((value) => (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="gap-1 text-[10px] font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(value);
                        }}
                      >
                        {labelFor(value)}
                        <PiX className="size-3" />
                      </Badge>
                    ))
                  )}
                </span>
                <PiCaretDown className="text-muted-foreground size-4 shrink-0" />
              </PopoverTrigger>
              <PopoverContent className="w-(--anchor-width) p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search…" />
                  <CommandList>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                      {options.map((opt) => {
                        const isSelected = selected.includes(opt.value);
                        return (
                          <CommandItem
                            key={opt.value}
                            value={opt.label}
                            onSelect={() => toggle(opt.value)}
                          >
                            <span
                              className={cn(
                                'border-input mr-1 flex size-3.5 items-center justify-center rounded-md border',
                                isSelected && 'bg-primary border-primary text-primary-foreground',
                              )}
                            >
                              {isSelected && <PiCheck className="size-3" />}
                            </span>
                            {opt.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FieldShell>
        );
      }}
    />
  );
}
