// src/components/shared/Dropdown.jsx
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";

/**
 * Универсальный дропдаун на базе shadcn/ui.
 *
 * Props:
 * - items: массив элементов. Поддерживает строки или объекты.
 * - value: текущее значение (строка/число/любой ключ).
 * - onChange: (val, item) => void
 * - placeholder: плейсхолдер в триггере
 * - searchPlaceholder: плейсхолдер поиска
 * - emptyText: текст, если ничего не найдено
 * - disabled: выключить дропдаун
 * - searchable: включить поиск (по умолчанию true)
 * - getKey(item): вернуть уникальный ключ (по умолчанию item?.id ?? item?.value ?? item)
 * - getLabel(item): вернуть label (по умолчанию item?.label ?? item?.name ?? String(item))
 * - getDescription(item): вернуть подстроку (опционально)
 * - className: классы для триггера-кнопки
 * - popoverProps: пропсы, которые пробрасываются в <PopoverContent />
 */
export function Dropdown({
  items = [],
  value,
  onChange,
  placeholder = "Выбрать...",
  searchPlaceholder = "Поиск…",
  emptyText = "Ничего не найдено",
  disabled = false,
  searchable = true,
  getKey,
  getLabel,
  getDescription,
  className = "",
  popoverProps = {},
}) {
  const [open, setOpen] = useState(false);

  const _getKey = useMemo(
    () =>
      getKey ||
      ((item) => (item && typeof item === "object" ? item.id ?? item.value : item)),
    [getKey]
  );
  const _getLabel = useMemo(
    () =>
      getLabel ||
      ((item) =>
        item && typeof item === "object"
          ? item.label ?? item.name ?? String(_getKey(item))
          : String(item)),
    [getLabel]
  );
  const _getDescription =
    getDescription ||
    ((item) => (item && typeof item === "object" ? item.description ?? item.address : undefined));

  const selectedItem = useMemo(() => {
    return items.find((i) => String(_getKey(i)) === String(value));
  }, [items, value, _getKey]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`w-full justify-between rounded-full px-4 ${className}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="truncate">
            {selectedItem ? _getLabel(selectedItem) : placeholder}
          </span>
          <svg
            className={`ml-2 h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[220px]"
        align="start"
        sideOffset={8}
        {...popoverProps}
      >
        <Command shouldFilter={searchable}>
          {searchable && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty className="py-6 text-sm text-muted-foreground">
              {emptyText}
            </CommandEmpty>

            <CommandGroup>
              {items.map((item) => {
                const key = _getKey(item);
                const label = _getLabel(item);
                const desc = _getDescription(item);
                const active = String(value) === String(key);

                return (
                  <CommandItem
                    key={String(key)}
                    value={label}
                    onSelect={() => {
                      onChange?.(key, item);
                      setOpen(false);
                    }}
                    className="flex items-start gap-2"
                  >
                    <Check className={`mt-[2px] h-4 w-4 ${active ? "opacity-100" : "opacity-0"}`} />
                    <div className="flex flex-col">
                      <span className="text-sm">{label}</span>
                      {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
                    </div>
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

export default Dropdown;