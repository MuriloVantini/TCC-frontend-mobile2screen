import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "./utils";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type ComboboxChipsOption = {
  value: string;
  label: string;
};

type ComboboxChipsProps = {
  options: ComboboxChipsOption[];
  value: string[];
  onChange: (nextValue: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
};

export function ComboboxChips({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  emptyMessage = "Nenhum item encontrado.",
  searchPlaceholder = "Pesquisar...",
  className,
}: ComboboxChipsProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  const removeValue = (optionValue: string) => {
    onChange(value.filter((item) => item !== optionValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-10 w-full justify-between rounded-xl px-3 py-2",
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5 text-left">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((selected) => (
                <Badge
                  key={selected.value}
                  variant="secondary"
                  className="rounded-full px-2 py-0.5"
                >
                  {selected.label}
                  <button
                    type="button"
                    className="ml-1 inline-flex"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeValue(selected.value);
                    }}
                    aria-label={`Remover ${selected.label}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <Check className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                    <span>{option.label}</span>
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
