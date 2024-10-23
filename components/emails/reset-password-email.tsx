import { Button, Link, Section, Text } from "@react-email/components";

import { Container } from "@/components/email-blocks/container.section";
import { Email } from "@/components/email-blocks/email.section";
import { Footer } from "@/components/email-blocks/footer.section";
import { Header } from "@/components/email-blocks/header.section";

export type Section = "text" | "buttonContainer" | "button" | "content";

interface ResetPasswordEmailProps {
  name: string;
  webUrl: string;
}

export default function ResetPasswordEmail({
  name,
  webUrl,
}: Partial<ResetPasswordEmailProps>): React.ReactElement {
  return (
    <Email previewText="Mundo Bebé reestablece tu contraseña">
      <Container>
        <Header />
        <Section style={styles.content}>
          <Text style={styles.text}>¡Hola {name}!</Text>
          <Text style={styles.text}>
            Alguien ha solicitado cambiar tu contraseña en Mundo Bebé. Si fuiste
            tú, haz clic en el botón para completar el proceso:
          </Text>
          <Section style={styles.buttonContainer}>
            <Button style={styles.button} href={webUrl}>
              Cambiar contraseña
            </Button>
          </Section>
          <Text style={styles.text}>
            Si el botón no funciona, puedes dar clic en el siguiente enlace:{" "}
            <Link href={webUrl}>Haz clic aquí</Link>
          </Text>
          <Text style={styles.text}>
            <b>
              Si no quieres cambiar tu contraseña o no lo solicitaste, sólo
              ignora y elimina este correo.
            </b>
          </Text>
          <Text style={styles.text}>
            Para mantener tu cuenta segura, te recomendamos que no compartas los
            datos de tu cuenta con nadie.
          </Text>
          <Text style={styles.text}>
            Gracias,
            <br />
            Equipo Mundo Bebé
          </Text>
        </Section>
      </Container>
      <Footer />
    </Email>
  );
}

const styles: Record<Section, React.CSSProperties> = {
  content: {
    padding: "5px 20px 10px 20px",
  },
  text: {
    color: "#32355d",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  buttonContainer: {
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ff7096",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center",
    display: "block",
    padding: "12px",
    width: "max-content",
    margin: "0 auto",
  },
};
