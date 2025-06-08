import { Badge } from "@/components/ui/badge";

interface DataTableCellBooleanProps
  extends React.ComponentPropsWithoutRef<typeof Badge> {
  value: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const DataTableCellBoolean: React.FC<DataTableCellBooleanProps> = ({
  value,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
  ...props
}) => {
  return (
    <Badge variant={value ? "success" : "destructive"} {...props}>
      {value ? activeLabel : inactiveLabel}
    </Badge>
  );
};
