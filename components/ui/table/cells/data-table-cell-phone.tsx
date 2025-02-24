import {
  formatPhoneNumber,
  formatPhoneNumberIntl,
} from "react-phone-number-input";

interface DataTableCellPhoneProps extends React.HTMLAttributes<HTMLDivElement> {
  phoneNumber: string | null;
  international?: boolean;
}

export function DataTableCellPhone({
  className,
  phoneNumber,
  international = false,
  ...props
}: DataTableCellPhoneProps) {
  if (!phoneNumber) return null;
  return (
    <div className={className} {...props}>
      {!international
        ? formatPhoneNumber(phoneNumber)
        : formatPhoneNumberIntl(phoneNumber)}
    </div>
  );
}
