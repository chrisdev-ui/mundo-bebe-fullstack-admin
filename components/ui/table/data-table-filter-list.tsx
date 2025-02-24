"use client";

import { useId } from "react";
import {
  IconCalendar,
  IconCheck,
  IconFilter,
  IconGripVertical,
  IconSelector,
  IconTrash,
} from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { customAlphabet } from "nanoid";
import { parseAsStringEnum, useQueryState } from "nuqs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FacetedFilter,
  FacetedFilterContent,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterInput,
  FacetedFilterItem,
  FacetedFilterList,
  FacetedFilterTrigger,
} from "@/components/ui/faceted-filter";
import { Input } from "@/components/ui/input";
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
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import { dataTableConfig } from "@/config/data-table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table";
import { getFiltersStateParser } from "@/lib/parsers";
import { cn } from "@/lib/utils";
import type {
  DataTableAdvancedFilterField,
  Filter,
  FilterOperator,
  JoinOperator,
  StringKeyOf,
} from "@/types";

interface DataTableFilterListProps<TData> {
  table: Table<TData>;
  filterFields: DataTableAdvancedFilterField<TData>[];
  debounceMs: number;
  shallow?: boolean;
}

export function DataTableFilterList<TData>({
  table,
  filterFields,
  debounceMs,
  shallow,
}: DataTableFilterListProps<TData>) {
  const id = useId();
  const [filters, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser(table.getRowModel().rows[0]?.original)
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
      }),
  );

  const [joinOperator, setJoinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    }),
  );

  const debouncedSetFilters = useDebouncedCallback(setFilters, debounceMs);

  function addFilter() {
    const filterField = filterFields[0];

    if (!filterField) return;

    void setFilters([
      ...filters,
      {
        id: filterField.id,
        value: "",
        type: filterField.type,
        operator: getDefaultFilterOperator(filterField.type),
        rowId: customAlphabet(
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
          6,
        )(),
      },
    ]);
  }

  function updateFilter({
    rowId,
    field,
    debounced = false,
  }: {
    rowId: string;
    field: Omit<Partial<Filter<TData>>, "rowId">;
    debounced?: boolean;
  }) {
    const updateFunction = debounced ? debouncedSetFilters : setFilters;
    updateFunction((prevFilters) => {
      const updatedFilters = prevFilters.map((filter) => {
        if (filter.rowId === rowId) {
          return { ...filter, ...field };
        }
        return filter;
      });
      return updatedFilters;
    });
  }

  function removeFilter(rowId: string) {
    const updatedFilters = filters.filter((filter) => filter.rowId !== rowId);
    void setFilters(updatedFilters);
  }

  function moveFilter(activeIndex: number, overIndex: number) {
    void setFilters((prevFilters) => {
      const newFilters = [...prevFilters];
      const [removed] = newFilters.splice(activeIndex, 1);
      if (!removed) return prevFilters;
      newFilters.splice(overIndex, 0, removed);
      return newFilters;
    });
  }

  function renderFilterInput({
    filter,
    inputId,
  }: {
    filter: Filter<TData>;
    inputId: string;
  }) {
    const filterField = filterFields.find((f) => f.id === filter.id);

    if (!filterField) return null;

    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
      return (
        <div
          id={inputId}
          role="status"
          aria-live="polite"
          aria-label={`${filterField.label} filter is ${filter.operator === "isEmpty" ? "empty" : "not empty"}`}
          className="h-8 w-full rounded border border-dashed"
        />
      );
    }

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            id={inputId}
            type={filter.type}
            aria-label={`Valor de filtro ${filterField.label}`}
            aria-describedby={`${inputId}-description`}
            placeholder={filterField.placeholder ?? "Ingrese un valor..."}
            className="h-8 w-full rounded"
            defaultValue={
              typeof filter.value === "string" ? filter.value : undefined
            }
            onChange={(event) =>
              updateFilter({
                rowId: filter.rowId,
                field: { value: event.target.value },
                debounced: true,
              })
            }
          />
        );
      case "select":
        return (
          <FacetedFilter>
            <FacetedFilterTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`Valor de filtro ${filterField.label}`}
                aria-controls={`${inputId}-listbox`}
                className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
              >
                {filter.value && typeof filter.value === "string" ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {filterField?.options?.find(
                      (option) => option.value === filter.value,
                    )?.label || filter.value}
                  </Badge>
                ) : (
                  <>
                    {filterField.placeholder ?? "Selecciona una opción..."}
                    <IconSelector className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </FacetedFilterTrigger>
            <FacetedFilterContent
              id={`${inputId}-listbox`}
              className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
            >
              <FacetedFilterInput
                placeholder={filterField?.label ?? "Buscar opciones..."}
                aria-label={`Buscar opciones para ${filterField?.label}`}
              />
              <FacetedFilterList>
                <FacetedFilterEmpty>
                  No se encontraron opciones.
                </FacetedFilterEmpty>
                <FacetedFilterGroup>
                  {filterField?.options?.map((option) => (
                    <FacetedFilterItem
                      key={option.value}
                      value={option.value}
                      selected={filter.value === option.value}
                      onSelect={(value) => {
                        updateFilter({ rowId: filter.rowId, field: { value } });
                        setTimeout(() => {
                          document.getElementById(inputId)?.click();
                        }, 0);
                      }}
                    >
                      {option.icon && (
                        <option.icon
                          className="mr-2 size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span>{option.label}</span>
                      {option.count && (
                        <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                          {option.count}
                        </span>
                      )}
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        );
      case "multi-select": {
        const selectedValues = new Set(
          Array.isArray(filter.value) ? filter.value : [],
        );

        return (
          <FacetedFilter>
            <FacetedFilterTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`Opciones de filtro para ${filterField.label}`}
                aria-controls={`${inputId}-listbox`}
                className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
              >
                {selectedValues.size === 0 && (
                  <>
                    {filterField.placeholder ?? " Selecciona opciones..."}
                    <IconSelector className="size-4" aria-hidden="true" />
                  </>
                )}
                {selectedValues?.size > 0 && (
                  <div className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal lg:hidden"
                    >
                      {selectedValues.size}
                    </Badge>
                    <div className="hidden min-w-0 gap-1 lg:flex">
                      {selectedValues.size > 2 ? (
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {selectedValues.size} seleccionados
                        </Badge>
                      ) : (
                        filterField?.options
                          ?.filter((option) => selectedValues.has(option.value))
                          .map((option) => (
                            <Badge
                              variant="secondary"
                              key={option.value}
                              className="truncate rounded-sm px-1 font-normal"
                            >
                              {option.label}
                            </Badge>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </Button>
            </FacetedFilterTrigger>
            <FacetedFilterContent
              id={`${inputId}-listbox`}
              className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
            >
              <FacetedFilterInput
                aria-label={`Buscar opciones para ${filterField?.label}`}
                placeholder={filterField?.label ?? "Buscar opciones..."}
              />
              <FacetedFilterList>
                <FacetedFilterEmpty>
                  No se encontraron opciones.
                </FacetedFilterEmpty>
                <FacetedFilterGroup>
                  {filterField?.options?.map((option) => (
                    <FacetedFilterItem
                      key={option.value}
                      value={option.value}
                      selected={selectedValues.has(option.value)}
                      onSelect={(value) => {
                        const currentValue = Array.isArray(filter.value)
                          ? filter.value
                          : [];
                        const newValue = currentValue.includes(value)
                          ? currentValue.filter((v) => v !== value)
                          : [...currentValue, value];
                        updateFilter({
                          rowId: filter.rowId,
                          field: { value: newValue },
                        });
                      }}
                    >
                      {option.icon && (
                        <option.icon
                          className="mr-2 size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span>{option.label}</span>
                      {option.count && (
                        <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                          {option.count}
                        </span>
                      )}
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        );
      }
      case "date": {
        const dateValue = Array.isArray(filter.value)
          ? filter.value.filter(Boolean)
          : [filter.value, filter.value].filter(Boolean);

        const displayValue =
          filter.operator === "isBetween" && dateValue.length === 2
            ? `${format(dateValue[0] ?? new Date(), "yyyy-MM-dd", { locale: es })} - ${format(dateValue[1] ?? new Date(), "yyyy-MM-dd", { locale: es })}`
            : dateValue[0]
              ? format(dateValue[0], "yyyy-MM-dd", { locale: es })
              : "Selecciona una fecha";

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`Filtro de fecha para ${filterField.label}`}
                aria-controls={`${inputId}-calendar`}
                className={cn(
                  "h-8 w-full justify-start gap-2 rounded text-left font-normal",
                  !filter.value && "text-muted-foreground",
                )}
              >
                <IconCalendar
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{displayValue}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              id={`${inputId}-calendar`}
              align="start"
              className="w-auto p-0"
            >
              {filter.operator === "isBetween" ? (
                <Calendar
                  id={`${inputId}-calendar`}
                  mode="range"
                  aria-label={`Seleccione un rango de fechas para ${filterField.label}`}
                  selected={
                    dateValue.length === 2
                      ? {
                          from: new Date(dateValue[0] ?? ""),
                          to: new Date(dateValue[1] ?? ""),
                        }
                      : {
                          from: new Date(),
                          to: new Date(),
                        }
                  }
                  onSelect={(date) => {
                    updateFilter({
                      rowId: filter.rowId,
                      field: {
                        value: date
                          ? [
                              date.from?.toISOString() ?? "",
                              date.to?.toISOString() ?? "",
                            ]
                          : [],
                      },
                    });
                  }}
                  initialFocus
                  numberOfMonths={1}
                />
              ) : (
                <Calendar
                  id={`${inputId}-calendar`}
                  mode="single"
                  aria-label={`Seleccione una fecha para ${filterField.label}`}
                  selected={dateValue[0] ? new Date(dateValue[0]) : undefined}
                  onSelect={(date) => {
                    updateFilter({
                      rowId: filter.rowId,
                      field: { value: date?.toISOString() ?? "" },
                    });

                    setTimeout(() => {
                      document.getElementById(inputId)?.click();
                    }, 0);
                  }}
                  initialFocus
                />
              )}
            </PopoverContent>
          </Popover>
        );
      }
      case "boolean": {
        if (Array.isArray(filter.value)) return null;

        return (
          <Select
            value={filter.value}
            onValueChange={(value) =>
              updateFilter({ rowId: filter.rowId, field: { value } })
            }
          >
            <SelectTrigger
              id={inputId}
              aria-label={`Filtro booleano para ${filterField.label}`}
              aria-controls={`${inputId}-listbox`}
              className="h-8 w-full rounded bg-transparent"
            >
              <SelectValue placeholder={filter.value ? "True" : "False"} />
            </SelectTrigger>
            <SelectContent id={`${inputId}-listbox`}>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      }
      default:
        return null;
    }
  }

  return (
    <Sortable
      value={filters}
      getItemValue={(item) => item.rowId}
      onMove={({ activeIndex, overIndex }) =>
        moveFilter(activeIndex, overIndex)
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Open filters"
            aria-controls={`${id}-filter-dialog`}
          >
            <IconFilter className="size-3" aria-hidden="true" />
            Filtros
            {filters.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal"
              >
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`${id}-filter-dialog`}
          align="start"
          collisionPadding={16}
          className={cn(
            "flex w-[calc(100vw-theme(spacing.12))] min-w-60 origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[36rem]",
            filters.length > 0 ? "gap-3.5" : "gap-2",
          )}
        >
          {filters.length > 0 ? (
            <h4 className="font-medium leading-none">Filtros</h4>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="font-medium leading-none">
                No se aplicaron filtros
              </h4>
              <p className="text-sm text-muted-foreground">
                Agregue filtros para refinar sus resultados.
              </p>
            </div>
          )}
          <SortableContent asChild>
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto py-0.5 pr-1">
              {filters.map((filter, index) => {
                const filterId = `${id}-filter-${filter.rowId}`;
                const joinOperatorListboxId = `${filterId}-join-operator-listbox`;
                const fieldListboxId = `${filterId}-field-listbox`;
                const fieldTriggerId = `${filterId}-field-trigger`;
                const operatorListboxId = `${filterId}-operator-listbox`;
                const inputId = `${filterId}-input`;

                return (
                  <SortableItem key={filter.rowId} value={filter.rowId} asChild>
                    <div className="flex items-center gap-2">
                      <div className="min-w-[4.5rem] text-center">
                        {index === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            Where
                          </span>
                        ) : index === 1 ? (
                          <Select
                            value={joinOperator}
                            onValueChange={(value: JoinOperator) =>
                              setJoinOperator(value)
                            }
                          >
                            <SelectTrigger
                              aria-label="Seleccione un operador de unión"
                              aria-controls={joinOperatorListboxId}
                              className="h-8 rounded lowercase"
                            >
                              <SelectValue placeholder={joinOperator} />
                            </SelectTrigger>
                            <SelectContent
                              id={joinOperatorListboxId}
                              position="popper"
                              className="min-w-[var(--radix-select-trigger-width)] lowercase"
                            >
                              {dataTableConfig.joinOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {joinOperator}
                          </span>
                        )}
                      </div>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            id={fieldTriggerId}
                            variant="outline"
                            size="sm"
                            role="combobox"
                            aria-label="Seleccione un campo de filtro"
                            aria-controls={fieldListboxId}
                            className="h-8 w-32 justify-between gap-2 rounded focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0"
                          >
                            <span className="truncate">
                              {filterFields.find(
                                (field) => field.id === filter.id,
                              )?.label ?? "Selecciona un campo"}
                            </span>
                            <IconSelector className="size-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          id={fieldListboxId}
                          align="start"
                          className="w-40 p-0"
                          onCloseAutoFocus={() =>
                            document.getElementById(fieldTriggerId)?.focus({
                              preventScroll: true,
                            })
                          }
                        >
                          <Command>
                            <CommandInput placeholder="Buscar campos..." />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron campos.
                              </CommandEmpty>
                              <CommandGroup>
                                {filterFields.map((field) => (
                                  <CommandItem
                                    key={field.id}
                                    value={field.id}
                                    onSelect={(value) => {
                                      const filterField = filterFields.find(
                                        (col) => col.id === value,
                                      );

                                      if (!filterField) return;

                                      updateFilter({
                                        rowId: filter.rowId,
                                        field: {
                                          id: value as StringKeyOf<TData>,
                                          type: filterField.type,
                                          operator: getDefaultFilterOperator(
                                            filterField.type,
                                          ),
                                          value: "",
                                        },
                                      });

                                      document
                                        .getElementById(fieldTriggerId)
                                        ?.click();
                                    }}
                                  >
                                    <span className="mr-1.5 truncate">
                                      {field.label}
                                    </span>
                                    <IconCheck
                                      className={cn(
                                        "ml-auto size-4 shrink-0",
                                        field.id === filter.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={filter.operator}
                        onValueChange={(value: FilterOperator) =>
                          updateFilter({
                            rowId: filter.rowId,
                            field: {
                              operator: value,
                              value:
                                value === "isEmpty" || value === "isNotEmpty"
                                  ? ""
                                  : filter.value,
                            },
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label="Seleccione un operador de filtro"
                          aria-controls={operatorListboxId}
                          className="h-8 w-32 rounded"
                        >
                          <div className="truncate">
                            <SelectValue placeholder={filter.operator} />
                          </div>
                        </SelectTrigger>
                        <SelectContent id={operatorListboxId}>
                          {getFilterOperators(filter.type).map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="min-w-36 flex-1">
                        {renderFilterInput({ filter, inputId })}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Eliminar filtro ${index + 1}`}
                        className="size-8 shrink-0 rounded"
                        onClick={() => removeFilter(filter.rowId)}
                      >
                        <IconTrash className="size-3.5" aria-hidden="true" />
                      </Button>
                      <SortableItemHandle
                        className="size-8 shrink-0 rounded"
                        asChild
                      >
                        <Button variant="outline" size="icon">
                          <IconGripVertical
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </Button>
                      </SortableItemHandle>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContent>
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="h-[1.85rem] rounded"
              onClick={addFilter}
            >
              Agregar filtro
            </Button>
            {filters.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded"
                onClick={() => {
                  void setFilters(null);
                  void setJoinOperator("and");
                }}
              >
                Restablecer filtros
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      <SortableOverlay>
        <div className="flex items-center gap-2">
          <div className="h-8 min-w-[4.5rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 min-w-36 flex-1 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      </SortableOverlay>
    </Sortable>
  );
}
