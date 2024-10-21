import { Body, Head, Html, Preview } from "@react-email/components";

interface EmailWrapperProps extends React.PropsWithChildren {
  previewText: string;
}

type Section = "main";

export const Email = ({ children, previewText }: EmailWrapperProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>{children}</Body>
    </Html>
  );
};

const styles: Record<Section, React.CSSProperties> = {
  main: {
    backgroundColor: "#efeef1",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  },
};
