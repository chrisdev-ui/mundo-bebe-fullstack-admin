import { IconBoxModel2, IconPick } from "@tabler/icons-react";

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  featureFlags: [
    {
      label: "Tabla avanzada",
      value: "advancedTable" as const,
      icon: IconPick,
      tooltipTitle: "Alternar tabla avanzada",
      tooltipDescription: "Un filtro y ordenador para filtrar y ordenar filas.",
    },
    {
      label: "Barra flotante",
      value: "floatingBar" as const,
      icon: IconBoxModel2,
      tooltipTitle: "Alternar barra flotante",
      tooltipDescription:
        "Una barra flotante que se mueve a la parte superior de la tabla.",
    },
  ],
  textOperators: [
    { label: "Contiene", value: "iLike" as const },
    { label: "No contiene", value: "notILike" as const },
    { label: "Es", value: "eq" as const },
    { label: "No es", value: "ne" as const },
    { label: "Es vacío", value: "isEmpty" as const },
    { label: "No es vacío", value: "isNotEmpty" as const },
  ],
  numericOperators: [
    { label: "Es", value: "eq" as const },
    { label: "No es", value: "ne" as const },
    { label: "Menor que", value: "lt" as const },
    { label: "Menor o igual que", value: "lte" as const },
    { label: "Mayor que", value: "gt" as const },
    { label: "Mayor o igual que", value: "gte" as const },
    { label: "Es vacío", value: "isEmpty" as const },
    { label: "No es vacío", value: "isNotEmpty" as const },
  ],
  dateOperators: [
    { label: "Es", value: "eq" as const },
    { label: "No es", value: "ne" as const },
    { label: "Anterior a", value: "lt" as const },
    { label: "Posterior a", value: "gt" as const },
    { label: "Anterior o igual a", value: "lte" as const },
    { label: "Posterior o igual a", value: "gte" as const },
    { label: "Entre", value: "isBetween" as const },
    { label: "En relación con hoy", value: "isRelativeToToday" as const },
    { label: "Es vacío", value: "isEmpty" as const },
    { label: "No es vacío", value: "isNotEmpty" as const },
  ],
  selectOperators: [
    { label: "Es", value: "eq" as const },
    { label: "No es", value: "ne" as const },
    { label: "Es vacío", value: "isEmpty" as const },
    { label: "No es vacío", value: "isNotEmpty" as const },
  ],
  booleanOperators: [
    { label: "Es", value: "eq" as const },
    { label: "No es", value: "ne" as const },
  ],
  joinOperators: [
    { label: "Y", value: "and" as const },
    { label: "O", value: "or" as const },
  ],
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const },
  ],
  columnTypes: [
    "text",
    "number",
    "date",
    "boolean",
    "select",
    "multi-select",
  ] as const,
  globalOperators: [
    "iLike",
    "notILike",
    "eq",
    "ne",
    "isEmpty",
    "isNotEmpty",
    "lt",
    "lte",
    "gt",
    "gte",
    "isBetween",
    "isRelativeToToday",
    "and",
    "or",
  ] as const,
};
