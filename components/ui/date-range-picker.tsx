"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";
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
import { cn, formatCaption, formatMonthCaption } from "@/lib/utils";
import { CustomDate } from "@/types";

interface DateRangePickerProps<T extends FieldValues>
  extends React.HTMLAttributes<HTMLDivElement> {
  customDates?: Array<CustomDate>;
  name: FieldPath<T>;
  control: Control<T>;
  placeholder?: string;
  disabled?: boolean;
}

const currentYear = new Date().getFullYear();

export function DateRangePicker<T extends FieldValues>({
  className,
  customDates = [],
  placeholder = "Selecciona un rango de fechas",
  name,
  control,
  ...props
}: DateRangePickerProps<T>) {
  const [customDateSelected, setCustomDateselected] = useState<string>("");

  const {
    field: { value, onChange },
  } = useController({ name, control });

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setCustomDateselected("");
    onChange(selectedDate);
  };

  const handleCustomDates = (
    customDateSelected: string,
    selectedDate: DateRange,
  ) => {
    setCustomDateselected(customDateSelected);
    onChange(selectedDate);
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("justify-between bg-white px-3.5 py-2.5")}
          >
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "PPPP", { locale: es })} -{" "}
                  {format(value.to, "PPPP", { locale: es })}
                </>
              ) : (
                format(value.from, "PPPP", { locale: es })
              )
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarDays className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-row">
            <div className="flex max-h-[350px] flex-col overflow-y-auto">
              {customDates.map((customDate: CustomDate) => (
                <Button
                  key={customDate.name}
                  variant="ghost"
                  className={cn("justify-start", {
                    "bg-accent text-accent-foreground":
                      customDateSelected === customDate.name,
                  })}
                  onClick={() => {
                    handleCustomDates(customDate.name, {
                      from: customDate.from,
                      to: customDate.to,
                    });
                  }}
                >
                  {customDate.name}
                </Button>
              ))}
            </div>
            <Calendar
              mode="range"
              defaultMonth={value?.from}
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
    </div>
  );
}
