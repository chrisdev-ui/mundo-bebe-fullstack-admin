import { Column, Img, Row, Section } from "@react-email/components";

type Section = "logo" | "sectionsBorders" | "sectionBorder" | "sectionCenter";

export const Header = () => {
  return (
    <>
      <Section style={styles.logo}>
        <Img
          src={`https://pub-8a8e464c92624fb2a9b19755bfeec6cc.r2.dev/walmart.png`}
          width="170"
          height="50"
          alt="Logo Mundo Bebé"
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
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
    borderBottom: "1px solid #ff7096",
    width: "102px",
  },
};