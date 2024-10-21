import { Container as ContainerComponent } from "@react-email/components";

interface ContainerProps extends React.PropsWithChildren {
  className?: string;
}

type Section = "container";

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <ContainerComponent
      style={{
        ...styles.container,
        ...(className && { className }),
      }}
    >
      {children}
    </ContainerComponent>
  );
};

const styles: Record<Section, React.CSSProperties> = {
  container: {
    maxWidth: "580px",
    margin: "30px auto",
    backgroundColor: "#ffffff",
  },
};
