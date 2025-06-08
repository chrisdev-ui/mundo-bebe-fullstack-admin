import { Column, Img, Row, Section } from "@react-email/components";

type Section =
  | "logo"
  | "image"
  | "sectionsBorders"
  | "sectionBorder"
  | "sectionCenter";

export const Header = () => {
  return (
    <>
      <Section style={styles.logo}>
        <Img
          src="https://pub-8a8e464c92624fb2a9b19755bfeec6cc.r2.dev/Logo%20Mundo%20Bebe%CC%81.png"
          width="170"
          height="170"
          alt="Logo Mundo Bebé"
          style={styles.image}
        />
      </Section>
      <Section style={styles.sectionsBorders}>
        <Row>
          <Column style={styles.sectionBorder} />
          <Column style={styles.sectionCenter} />
          <Column style={styles.sectionBorder} />
        </Row>
      </Section>
    </>
  );
};

const styles: Record<Section, React.CSSProperties> = {
  logo: {
    padding: "0px",
    width: "100%",
  },
  image: {
    margin: "0 auto",
  },
  sectionsBorders: {
    width: "100%",
    display: "flex",
  },
  sectionBorder: {
    borderBottom: "1px solid #efeef1",
    width: "249px",
  },
  sectionCenter: {
    borderBottom: "1px solid #ff5299",
    width: "102px",
  },
};
