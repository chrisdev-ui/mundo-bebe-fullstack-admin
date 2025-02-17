"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { IconCheck, IconEye, IconEyeOff, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input, InputProps } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PASSWORD_REQUIREMENTS } from "@/constants";
import { cn } from "@/lib/utils";

const PasswordInput = forwardRef<
  HTMLInputElement,
  InputProps & {
    showStrengthIndicator?: boolean;
  }
>(({ className, showStrengthIndicator = true, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const innerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => innerRef.current!);

  const disabled = props.disabled;

  const checkStrength = useCallback(() => {
    const password = innerRef.current?.value ?? "";
    return [
      ...PASSWORD_REQUIREMENTS.map(({ regex, text }) => ({
        met: regex.test(password),
        text,
      })),
    ];
  }, []);

  const getStrengthScore = useCallback(
    () => checkStrength().filter((req) => req.met).length,
    [checkStrength],
  );

  const getStrengthColor = (score: number) => {
    const colorMap: Record<number, string> = {
      0: "bg-slate-200",
      1: "bg-destructive",
      2: "bg-destructive",
      3: "bg-orange-500",
      4: "bg-warning",
      5: "bg-success",
    };
    return colorMap[score] ?? "bg-success";
  };

  const getStrengthText = (score: number) => {
    const textMap: Record<number, string> = {
      0: "Escribe una contraseña",
      1: "Contraseña débil",
      2: "Contraseña débil",
      3: "Contraseña intermedia",
      4: "Contraseña fuerte",
      5: "Contraseña muy fuerte",
    };
    return textMap[score] ?? "Contraseña muy fuerte";
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("hide-password-toggle pr-10", className)}
          ref={innerRef}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={
            showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          aria-pressed={showPassword}
          aria-controls="password"
          disabled={disabled}
        >
          {disabled || !props.value ? (
            <IconEyeOff size={20} aria-hidden="true" />
          ) : showPassword ? (
            <IconEye size={20} aria-hidden="true" />
          ) : (
            <IconEyeOff size={20} aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          </span>
        </Button>
      </div>
      {showStrengthIndicator && (isFocused || props.value) && (
        <div className="animate-fade-down space-y-2 animate-once">
          <Progress
            value={(getStrengthScore() / checkStrength().length) * 100}
            className="h-1"
            indicatorColor={getStrengthColor(getStrengthScore())}
          />
          <div className="flex justify-between text-sm">
            <span>{getStrengthText(getStrengthScore())}. Debe contener:</span>
            <span>
              {getStrengthScore()}/{checkStrength().length}
            </span>
          </div>
          <ul className="space-y-1 text-xs">
            {checkStrength().map(({ met, text }, index) => (
              <li key={index} className={cn("flex items-center gap-2")}>
                {met ? (
                  <IconCheck
                    size={14}
                    className="text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <IconX
                    size={14}
                    className="text-muted-foreground/80"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(met ? "text-success" : "text-muted-foreground")}
                >
                  {text}
                  <span className="sr-only">
                    {met
                      ? "- Requerimiento cumplido"
                      : "- Requerimiento no cumplido"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style>{`
        .hide-password-toggle::-ms-reveal,
        .hide-password-toggle::-ms-clear {
            visibility: hidden;
            pointer-events: none;
            display: none;
        }
        `}</style>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
