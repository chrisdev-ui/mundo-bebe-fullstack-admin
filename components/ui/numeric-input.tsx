"use client";

import * as React from "react";
import { Hash, Minus, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NumericOrderInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showBadge?: boolean;
  showMinMax?: boolean;
  className?: string;
  placeholder?: string;
}

const NumericOrderInput = React.forwardRef<
  HTMLInputElement,
  NumericOrderInputProps
>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 9999,
      step = 1,
      disabled = false,
      showBadge = true,
      showMinMax = true,
      className,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const handleIncrement = () => {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    };

    const handleDecrement = () => {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(min);
        return;
      }

      const numValue = Number.parseInt(inputValue, 10);
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(Math.max(numValue, min), max);
        onChange(clampedValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDecrement();
      }
    };

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-r-none border-r-0 hover:bg-muted"
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            tabIndex={-1}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Disminuir orden</span>
          </Button>

          <div className="relative flex-1">
            <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={ref}
              type="number"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="rounded-none border-x-0 pl-10 pr-4 text-center font-mono text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              placeholder={placeholder}
              {...props}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-l-none border-l-0 hover:bg-muted"
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            tabIndex={-1}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Incrementar orden</span>
          </Button>
        </div>

        {(showMinMax || showBadge) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {showMinMax && <span>Mín: {min}</span>}
            {showBadge && (
              <Badge variant="secondary" className="font-mono text-xs">
                #{value}
              </Badge>
            )}
            {showMinMax && <span>Máx: {max}</span>}
          </div>
        )}
      </div>
    );
  },
);

NumericOrderInput.displayName = "NumericOrderInput";

export { NumericOrderInput };
