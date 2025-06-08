import type React from "react";
import { Droplets } from "lucide-react";

import { cn } from "@/lib/utils";

interface DataTableCellColorProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
}

// Utility function to parse color values (same as in ColorPicker)
const parseColorValue = (
  value: string,
): {
  hex: string;
  alpha: number;
  isTransparent: boolean;
  displayValue: string;
} => {
  if (!value || value === "transparent" || value === "none") {
    return {
      hex: "#FFFFFF",
      alpha: 0,
      isTransparent: true,
      displayValue: "TRANSPARENT",
    };
  }

  // Handle rgba format
  const rgbaMatch = value.match(
    /rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$$/,
  );
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const alpha = a ? Number(a) : 1;
    const displayValue =
      alpha < 1 ? value.toUpperCase() : `RGB(${r}, ${g}, ${b})`;
    return {
      hex: `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, "0")).join("")}`,
      alpha,
      isTransparent: alpha === 0,
      displayValue,
    };
  }

  // Handle hex format
  const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  if (isValidHex) {
    return {
      hex: value,
      alpha: 1,
      isTransparent: false,
      displayValue: value.toUpperCase(),
    };
  }

  // Fallback
  return {
    hex: "#FFFFFF",
    alpha: 1,
    isTransparent: false,
    displayValue: value.toUpperCase(),
  };
};

const CheckerboardPattern = ({ size = 24 }: { size?: number }) => (
  <div className="absolute inset-0">
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id={`checkerboard-${size}`}
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="4" height="4" fill="#e5e7eb" />
          <rect x="4" y="4" width="4" height="4" fill="#e5e7eb" />
          <rect x="0" y="4" width="4" height="4" fill="#f3f4f6" />
          <rect x="4" y="0" width="4" height="4" fill="#f3f4f6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#checkerboard-${size})`} />
    </svg>
  </div>
);

export function DataTableCellColor({
  className,
  color,
  ...props
}: DataTableCellColorProps) {
  const parsedColor = parseColorValue(color);

  const displayColor = parsedColor.isTransparent
    ? "transparent"
    : parsedColor.alpha < 1
      ? `rgba(${parsedColor.hex
          .slice(1)
          .match(/.{2}/g)
          ?.map((hex) => Number.parseInt(hex, 16))
          .join(", ")}, ${parsedColor.alpha})`
      : parsedColor.hex;

  return (
    <div className={cn("flex items-center gap-x-2", className)} {...props}>
      <span className="font-mono text-sm">{parsedColor.displayValue}</span>
      <div className="relative h-6 w-6 overflow-hidden rounded-full border border-gray-300">
        {/* Show checkerboard pattern for transparent or semi-transparent colors */}
        {(parsedColor.isTransparent || parsedColor.alpha < 1) && (
          <CheckerboardPattern size={24} />
        )}

        {/* Color overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: displayColor }}
        />

        {/* Transparent indicator */}
        {parsedColor.isTransparent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="h-3 w-3 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
}
