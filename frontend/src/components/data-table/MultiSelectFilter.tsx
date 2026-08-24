import { useState } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
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
import type { Option } from '@/hooks/options/useAdminOptions';

/**
 * A page-level multi-select filter — same checkable Popover+Command UI as `<MultiSelectField>`,
 * but bound to plain `useState` instead of a react-hook-form `Controller`, for `<DataTable>`
 * toolbar filters (class/section/session, status, etc.) rather than a form field
 * (ALIGNMENT_PLAN.md Part 3.2/3.3 — "multi-select class/section/session filters").
 */
export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-normal"
          />
        }
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <Badge variant="secondary" className="h-4 px-1 text-[10px] font-semibold">
            {selected.length}
          </Badge>
        )}
        <ChevronDownIcon className="text-muted-foreground size-3.5 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${label.toLowerCase()}…`} />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <CommandItem key={opt.value} value={opt.label} onSelect={() => toggle(opt.value)}>
                    <span
                      className={cn(
                        'border-input mr-1 flex size-3.5 items-center justify-center rounded-none border',
                        isSelected && 'bg-primary border-primary text-primary-foreground',
                      )}
                    >
                      {isSelected && <CheckIcon className="size-3" />}
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
  );
}
