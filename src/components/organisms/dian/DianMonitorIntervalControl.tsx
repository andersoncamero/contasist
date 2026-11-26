import React, { useEffect, useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";
import { DianMonitorConfig, formatDianIntervalText } from "@/entities/dian";

const PRESET_INTERVALS = [1, 2, 5, 10, 15, 30, 60] as const;
const CUSTOM_OPTION = "custom";
const DEFAULT_MIN_MINUTES = 1;
const DEFAULT_MAX_MINUTES = 1440;
const DEFAULT_INTERVAL_MINUTES = 15;

interface DianMonitorIntervalControlProps {
  config?: DianMonitorConfig;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (intervalMinutes: number) => Promise<void>;
}

function formatPresetOption(minutes: number): string {
  if (minutes === 60) {
    return "60 minutos (1 hora)";
  }
  return formatDianIntervalText(minutes);
}

function isPresetInterval(minutes: number): boolean {
  return PRESET_INTERVALS.includes(minutes as (typeof PRESET_INTERVALS)[number]);
}

function validateMinutes(
  rawValue: string,
  minMinutes: number,
  maxMinutes: number
): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return "Ingresa un intervalo en minutos.";
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return "El intervalo debe ser un número entero.";
  }
  if (parsed < minMinutes || parsed > maxMinutes) {
    return `El intervalo debe estar entre ${minMinutes} y ${maxMinutes} minutos.`;
  }
  return null;
}

export const DianMonitorIntervalControl: React.FC<
  DianMonitorIntervalControlProps
> = ({ config, isLoading, isSaving, onSave }) => {
  const minMinutes = config?.min_interval_minutes ?? DEFAULT_MIN_MINUTES;
  const maxMinutes = config?.max_interval_minutes ?? DEFAULT_MAX_MINUTES;
  const currentMinutes = config?.interval_minutes ?? DEFAULT_INTERVAL_MINUTES;

  const [selectedOption, setSelectedOption] = useState<string>(() =>
    isPresetInterval(currentMinutes) ? String(currentMinutes) : CUSTOM_OPTION
  );
  const [customValue, setCustomValue] = useState<string>(() =>
    String(currentMinutes)
  );

  useEffect(() => {
    setSelectedOption(
      isPresetInterval(currentMinutes) ? String(currentMinutes) : CUSTOM_OPTION
    );
    setCustomValue(String(currentMinutes));
  }, [currentMinutes]);

  const isCustom = selectedOption === CUSTOM_OPTION;
  const validationError = isCustom
    ? validateMinutes(customValue, minMinutes, maxMinutes)
    : null;

  const resolvedMinutes = isCustom
    ? Number(customValue.trim())
    : Number(selectedOption);

  const hasChanges =
    !validationError && resolvedMinutes !== currentMinutes;

  const handlePresetChange = (value: string) => {
    setSelectedOption(value);
    if (value !== CUSTOM_OPTION) {
      setCustomValue(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validationError || !hasChanges || isSaving) {
      return;
    }
    await onSave(resolvedMinutes);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-md border bg-muted/30 p-4 flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary shrink-0" />
          <Label htmlFor="dian-monitor-preset" className="text-sm font-semibold">
            Frecuencia de monitoreo de correos
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Define cada cuántos minutos el monitor revisa el buzón en busca de nuevos tokens DIAN ({minMinutes}–{maxMinutes} minutos).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex flex-col gap-1.5 sm:w-64">
          <Select
            value={selectedOption}
            onValueChange={handlePresetChange}
            disabled={isLoading || isSaving}
          >
            <SelectTrigger id="dian-monitor-preset">
              <SelectValue placeholder="Selecciona un intervalo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PRESET_INTERVALS.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {formatPresetOption(minutes)}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_OPTION}>Personalizado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {isCustom && (
          <div className="flex flex-col gap-1.5 sm:w-44">
            <Label htmlFor="dian-monitor-custom-minutes" className="text-xs">
              Minutos personalizados
            </Label>
            <Input
              id="dian-monitor-custom-minutes"
              type="number"
              min={minMinutes}
              max={maxMinutes}
              step={1}
              value={customValue}
              disabled={isLoading || isSaving}
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? "dian-monitor-interval-error" : undefined
              }
              onChange={(event) => setCustomValue(event.target.value)}
            />
          </div>
        )}

        <Button
          type="submit"
          size="sm"
          disabled={isLoading || isSaving || !hasChanges || Boolean(validationError)}
          className="gap-1.5 sm:self-end"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save />
          )}
          Guardar
        </Button>
      </div>

      {validationError && (
        <p
          id="dian-monitor-interval-error"
          role="alert"
          className="text-xs text-destructive"
        >
          {validationError}
        </p>
      )}
    </form>
  );
};
