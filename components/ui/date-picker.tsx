"use client";

import { useMemo } from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCaption, formatMonthCaption } from "@/lib/utils";

interface DatePickerProps<T extends FieldValues> {
  className?: string;
  readonly showOptions?: boolean;
  readonly placeholder?: string;
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly disabled?: boolean;
}

export function DatePicker<T extends FieldValues>({
  className,
  placeholder,
  showOptions = true,
  name,
  control,
  disabled = false,
}: DatePickerProps<T>) {
  const {
    field: { value, onChange },
  } = useController({ name, control });

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "w-[280px] items-center justify-between text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {value ? (
            format(value, "PPP", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarDays className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        {showOptions ? (
          <Select
            onValueChange={(value) =>
              onChange(addDays(new Date(), parseInt(value)))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Escoge una opción" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="0">Hoy</SelectItem>
              <SelectItem value="1">Mañana</SelectItem>
              <SelectItem value="3">En 3 días</SelectItem>
              <SelectItem value="7">En una semana</SelectItem>
              <SelectItem value="14">En 2 semanas</SelectItem>
              <SelectItem value="30">En 30 días</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            fromYear={currentYear - 100}
            toYear={currentYear}
            captionLayout="dropdown-buttons"
            locale={es}
            formatters={{
              formatCaption,
              formatMonthCaption,
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
