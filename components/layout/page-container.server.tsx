import { ScrollArea } from "@/components/ui/scroll-area";

export const PageContainer: React.FC<{
  children: React.ReactNode;
  scrollable?: boolean;
}> = ({ children, scrollable = true }) => {
  return (
    <>
      {scrollable ? (
        <ScrollArea className="h-[calc(100dvh-52px)]">
          <div className="h-full p-4 md:px-8">{children}</div>
        </ScrollArea>
      ) : (
        <div className="h-full p-4 md:px-8">{children}</div>
      )}
    </>
  );
};
