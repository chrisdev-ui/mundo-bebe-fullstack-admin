import { Column, Img, Link, Row, Section, Text } from "@react-email/components";

type Section = "footer" | "address";

export const Footer = () => {
  return (
    <Section style={styles.footer}>
      <Row>
        <Column align="right" style={{ width: "50%", paddingRight: "8px" }}>
          <Link href="https://www.tiktok.com/@mundobebe" target="_blank">
            <Img
              src="https://pub-8a8e464c92624fb2a9b19755bfeec6cc.r2.dev/tiktok.png"
              width={28}
              height={28}
            />
          </Link>
        </Column>
        <Column align="left" style={{ width: "50%", paddingLeft: "8px" }}>
          <Link href="https://www.instagram.com/mundobebe/" target="_blank">
            <Img
              src="https://pub-8a8e464c92624fb2a9b19755bfeec6cc.r2.dev/instagram.png"
              width={28}
              height={28}
            />
          </Link>
        </Column>
      </Row>
      <Row>
        <Text style={styles.address}>
          © {new Date().getFullYear()} Mundo Bebé. Todos los derechos
          reservados. <br />
          Cra. 79 #6a-38, Kennedy, Bogotá - Colombia
        </Text>
      </Row>
    </Section>
  );
};

const styles: Record<Section, React.CSSProperties> = {
  footer: {
    maxWidth: "580px",
    margin: "0 auto",
  },
  address: {
    textAlign: "center",
    color: "#706a7b",
  },
};
