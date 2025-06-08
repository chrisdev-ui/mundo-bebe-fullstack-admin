"use client";

import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
  IconCheck,
  IconDroplets,
  IconPalette,
  IconRotateClockwise,
} from "@tabler/icons-react";
import { HexColorPicker, RgbColorPicker } from "react-colorful";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  enablePointerEvents?: boolean;
  showPresets?: boolean;
  showRecent?: boolean;
  presetColors?: string[];
  supportTransparency?: boolean;
}

// Utility functions for color conversion
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const parseColorValue = (
  value: string,
): { hex: string; alpha: number; isTransparent: boolean } => {
  if (!value || value === "transparent" || value === "none") {
    return { hex: "#FFFFFF", alpha: 0, isTransparent: true };
  }

  // Handle rgba format
  const rgbaMatch = value.match(
    /rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$$/,
  );
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const hex = rgbToHex(Number(r), Number(g), Number(b));
    const alpha = a ? Number(a) : 1;
    return { hex, alpha, isTransparent: alpha === 0 };
  }

  // Handle hex format
  const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  if (isValidHex) {
    const normalizedHex = normalizeHex(value);
    return { hex: normalizedHex, alpha: 1, isTransparent: false };
  }

  // Fallback
  return { hex: "#FFFFFF", alpha: 1, isTransparent: false };
};

const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

const normalizeHex = (hex: string): string => {
  if (!hex.startsWith("#")) hex = "#" + hex;
  if (hex.length === 4) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex.toUpperCase();
};

const DEFAULT_PRESETS = [
  "#FF0000",
  "#FF8000",
  "#FFFF00",
  "#80FF00",
  "#00FF00",
  "#00FF80",
  "#00FFFF",
  "#0080FF",
  "#0000FF",
  "#8000FF",
  "#FF00FF",
  "#FF0080",
  "#000000",
  "#404040",
  "#808080",
  "#C0C0C0",
  "#FFFFFF",
  "transparent",
];

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps
>(
  (
    {
      disabled,
      value,
      onChange,
      onBlur,
      name,
      className,
      enablePointerEvents = false,
      showPresets = true,
      showRecent = true,
      presetColors = DEFAULT_PRESETS,
      supportTransparency = true,
      ...props
    },
    forwardedRef,
  ) => {
    const [open, setOpen] = useState(false);
    const [hexInput, setHexInput] = useState("");
    const [rgbInput, setRgbInput] = useState({ r: 255, g: 255, b: 255 });
    const [alpha, setAlpha] = useState(1);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("hex");

    const parsedValue = useMemo(() => {
      return parseColorValue(value || "#FFFFFF");
    }, [value]);

    // Update inputs when value changes
    useEffect(() => {
      setHexInput(parsedValue.hex);
      setAlpha(parsedValue.alpha);
      const rgb = hexToRgb(parsedValue.hex);
      if (rgb) {
        setRgbInput(rgb);
      }
    }, [parsedValue]);

    // Load recent colors from localStorage
    useEffect(() => {
      if (showRecent) {
        const saved = localStorage.getItem("color-picker-recent");
        if (saved) {
          try {
            setRecentColors(JSON.parse(saved));
          } catch (e) {
            console.warn("Failed to parse recent colors from localStorage");
          }
        }
      }
    }, [showRecent]);

    const addToRecent = useCallback(
      (color: string) => {
        if (!showRecent) return;

        setRecentColors((prev) => {
          const filtered = prev.filter((c) => c !== color);
          const updated = [color, ...filtered].slice(0, 8);
          localStorage.setItem("color-picker-recent", JSON.stringify(updated));
          return updated;
        });
      },
      [showRecent],
    );

    const generateColorValue = useCallback(
      (hex: string, alphaValue: number) => {
        if (alphaValue === 0) return "transparent";
        if (alphaValue === 1) return hex;
        return hexToRgba(hex, alphaValue);
      },
      [],
    );

    const handleColorChange = useCallback(
      (newColor: string, newAlpha?: number) => {
        const currentAlpha = newAlpha !== undefined ? newAlpha : alpha;
        const colorValue = generateColorValue(newColor, currentAlpha);
        onChange(colorValue);
        addToRecent(colorValue);
      },
      [onChange, addToRecent, alpha, generateColorValue],
    );

    const handleAlphaChange = useCallback(
      (newAlpha: number) => {
        setAlpha(newAlpha);
        const colorValue = generateColorValue(parsedValue.hex, newAlpha);
        onChange(colorValue);
      },
      [onChange, parsedValue.hex, generateColorValue],
    );

    const handleHexInputChange = (inputValue: string) => {
      setHexInput(inputValue);

      if (isValidHex(inputValue)) {
        const normalizedColor = normalizeHex(inputValue);
        handleColorChange(normalizedColor);
        const rgb = hexToRgb(normalizedColor);
        if (rgb) {
          setRgbInput(rgb);
        }
      }
    };

    const handleRgbInputChange = (
      component: "r" | "g" | "b",
      inputValue: string,
    ) => {
      const numValue = Math.max(
        0,
        Math.min(255, Number.parseInt(inputValue) || 0),
      );
      const newRgb = { ...rgbInput, [component]: numValue };
      setRgbInput(newRgb);

      const hexColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      setHexInput(hexColor);
      handleColorChange(hexColor);
    };

    const handleRgbPickerChange = (rgb: {
      r: number;
      g: number;
      b: number;
    }) => {
      setRgbInput(rgb);
      const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);
      setHexInput(hexColor);
      handleColorChange(hexColor);
    };

    const handleTransparentClick = () => {
      onChange("transparent");
      addToRecent("transparent");
    };

    const CheckerboardPattern = () => (
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="checkerboard"
              x="0"
              y="0"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="4" height="4" fill="#ccc" />
              <rect x="4" y="4" width="4" height="4" fill="#ccc" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#checkerboard)" />
        </svg>
      </div>
    );

    const ColorPreview = ({
      color,
      size = "w-8 h-8",
      showTransparency = false,
    }: {
      color: string;
      size?: string;
      showTransparency?: boolean;
    }) => {
      const parsed = parseColorValue(color);
      const displayColor = parsed.isTransparent
        ? "transparent"
        : parsed.alpha < 1
          ? hexToRgba(parsed.hex, parsed.alpha)
          : parsed.hex;

      return (
        <div
          className={cn(
            "pointer-events-none relative overflow-hidden rounded border-2 border-border",
            size,
          )}
        >
          {showTransparency && (parsed.isTransparent || parsed.alpha < 1) && (
            <CheckerboardPattern />
          )}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: displayColor }}
          />
          {parsed.isTransparent && (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconDroplets className="h-3 w-3 text-gray-500" />
            </div>
          )}
        </div>
      );
    };

    return (
      <Popover modal={!!enablePointerEvents} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            className={cn("relative overflow-hidden", className)}
            size="icon"
            variant="outline"
          >
            <ColorPreview
              color={value || "#FFFFFF"}
              size="w-6 h-6"
              showTransparency
            />
            <IconPalette className="absolute bottom-0 right-0 h-3 w-3 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-80 p-4", {
            "pointer-events-auto": enablePointerEvents,
          })}
          onInteractOutside={(e) => {
            setOpen(false);
          }}
        >
          <div className="space-y-4">
            {/* Color Preview */}
            <div className="flex items-center gap-3">
              <ColorPreview
                color={value || "#FFFFFF"}
                size="w-12 h-12"
                showTransparency
              />
              <div className="flex-1">
                <Label className="text-sm font-medium">Current Color</Label>
                <p className="font-mono text-sm text-muted-foreground">
                  {parsedValue.isTransparent ? "transparent" : value}
                </p>
              </div>
            </div>

            {/* Transparency Controls */}
            {supportTransparency && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Transparencia</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTransparentClick}
                    className="h-6 px-2 text-xs"
                  >
                    Establecer Transparente
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="w-12 text-xs">Opacidad</Label>
                    <Slider
                      value={[alpha]}
                      onValueChange={(values) => handleAlphaChange(values[0])}
                      max={1}
                      min={0}
                      step={0.01}
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-xs">
                      {Math.round(alpha * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Color Picker Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hex">Hex</TabsTrigger>
                <TabsTrigger value="rgb">RGB</TabsTrigger>
              </TabsList>

              <TabsContent value="hex" className="space-y-3">
                <HexColorPicker
                  color={parsedValue.hex}
                  onChange={handleColorChange}
                  style={{ width: "100%" }}
                />
                <div className="space-y-2">
                  <Label htmlFor="hex-input">Valor Hexadecimal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hex-input"
                      ref={forwardedRef}
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      placeholder="#FFFFFF"
                      maxLength={7}
                      className={cn(
                        !isValidHex(hexInput) &&
                          hexInput !== "" &&
                          "border-destructive",
                      )}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleHexInputChange(parsedValue.hex)}
                      title="Reset to current color"
                    >
                      <IconRotateClockwise className="h-4 w-4" />
                    </Button>
                  </div>
                  {!isValidHex(hexInput) && hexInput !== "" && (
                    <p className="text-sm text-destructive">
                      El valor hexadecimal no es válido. Debe comenzar con "#" y
                      tener 3 o 6 caracteres hexadecimales.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rgb" className="space-y-3">
                <RgbColorPicker
                  color={rgbInput}
                  onChange={handleRgbPickerChange}
                  style={{ width: "100%" }}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="r-input" className="text-xs">
                      R
                    </Label>
                    <Input
                      id="r-input"
                      type="number"
                      min="0"
                      max="255"
                      value={rgbInput.r}
                      onChange={(e) =>
                        handleRgbInputChange("r", e.target.value)
                      }
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="g-input" className="text-xs">
                      G
                    </Label>
                    <Input
                      id="g-input"
                      type="number"
                      min="0"
                      max="255"
                      value={rgbInput.g}
                      onChange={(e) =>
                        handleRgbInputChange("g", e.target.value)
                      }
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="b-input" className="text-xs">
                      B
                    </Label>
                    <Input
                      id="b-input"
                      type="number"
                      min="0"
                      max="255"
                      value={rgbInput.b}
                      onChange={(e) =>
                        handleRgbInputChange("b", e.target.value)
                      }
                      className="text-center"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preset Colors */}
            {showPresets && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Colores Preestablecidos
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((color, index) => (
                    <Button
                      key={`${color}-${index}`}
                      variant="outline"
                      size="icon"
                      className="relative h-8 w-8 p-0"
                      onClick={() => {
                        onChange(color);
                        addToRecent(color);
                      }}
                    >
                      <ColorPreview
                        color={color}
                        size="w-6 h-6"
                        showTransparency
                      />
                      {value === color && (
                        <IconCheck className="absolute h-3 w-3 text-white drop-shadow-lg" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Colors */}
            {showRecent && recentColors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Colores Recientes</Label>
                <div className="flex flex-wrap gap-2">
                  {recentColors.map((color, index) => (
                    <Button
                      key={`${color}-${index}`}
                      variant="outline"
                      size="icon"
                      className="relative h-8 w-8 p-0"
                      onClick={() => {
                        onChange(color);
                      }}
                    >
                      <ColorPreview
                        color={color}
                        size="w-6 h-6"
                        showTransparency
                      />
                      {value === color && (
                        <IconCheck className="absolute h-3 w-3 text-white drop-shadow-lg" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
