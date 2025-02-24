import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DataTableCellDateProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date | null;
}

export function DataTableCellDate({
  className,
  date,
  ...props
}: DataTableCellDateProps) {
  if (!date) return null;
  return (
    <div className={className} {...props}>
      {format(date, "dd 'de' MMMM 'de' yyyy", { locale: es })}
    </div>
  );
}
