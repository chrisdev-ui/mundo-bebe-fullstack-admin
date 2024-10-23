import { Button, Link, Section, Text } from "@react-email/components";

import { Container } from "@/components/email-blocks/container.section";
import { Email } from "@/components/email-blocks/email.section";
import { Footer } from "@/components/email-blocks/footer.section";
import { Header } from "@/components/email-blocks/header.section";

type Section = "text" | "buttonContainer" | "button" | "content";

interface WelcomeEmailProps {
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  name: string;
  webUrl: string;
}

export default function WelcomeEmail({
  role,
  name,
  webUrl,
}: Partial<WelcomeEmailProps>): React.ReactElement {
  const previewText =
    role === "USER"
      ? "¡Bienvenido/a a Mundo Bebé!"
      : "¡Bienvenido/a a Mundo Bebé! Completa tu registro de administrador para continuar.";
  return (
    <Email previewText={previewText}>
      <Container>
        <Header />
        <Section style={styles.content}>
          <Text style={styles.text}>¡Bienvenido/a, {name}!</Text>
          {role === "USER" ? (
            <>
              <Text style={styles.text}>
                Estamos felices de tenerte en Mundo Bebé. Comienza a explorar la
                tienda con todos nuestros productos y disfruta de la experiencia
                completa.
              </Text>
              <Section style={styles.buttonContainer}>
                <Button style={styles.button} href={webUrl}>
                  Ir a la tienda
                </Button>
              </Section>
            </>
          ) : (
            <>
              <Text style={styles.text}>
                Has sido invitado/a a participar en la Pañalera Mundo Bebé como
                administrador. Por favor, completa tu registro para acceder a
                todas las funcionalidades de la tienda.
              </Text>
              <Section style={styles.buttonContainer}>
                <Button style={styles.button} href={webUrl}>
                  Completar registro
                </Button>
              </Section>
              <Text style={styles.text}>
                Si el botón no funciona, puedes dar clic en el siguiente enlace:{" "}
                <Link href={webUrl}>Haz clic aquí</Link>
              </Text>
            </>
          )}
          <Text style={styles.text}>
            Saludos,
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
