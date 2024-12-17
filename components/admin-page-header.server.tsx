import { Heading } from "@/components/ui/heading";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode | React.ReactNode[];
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <Heading title={title} description={description} />
      {children}
    </div>
  );
};
