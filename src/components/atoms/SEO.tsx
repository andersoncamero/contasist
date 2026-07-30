import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const BASE_URL = "https://contasist.app";

export const SEO = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
}: SEOProps) => {
  const fullTitle = `${title} | ContAsist`;
  const siteDescription = description || "Sistema de contabilidad, facturación e inventario para pequeñas y medianas empresas.";
  const siteOgTitle = ogTitle || title;
  const siteOgDescription = ogDescription || siteDescription;
  const siteOgImage = ogImage || `${BASE_URL}/logo-sidebar.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta property="og:title" content={siteOgTitle} />
      <meta property="og:description" content={siteOgDescription} />
      <meta property="og:image" content={siteOgImage} />
      <meta property="og:url" content={BASE_URL} />
      <meta name="twitter:title" content={siteOgTitle} />
      <meta name="twitter:description" content={siteOgDescription} />
      <meta name="twitter:image" content={siteOgImage} />
    </Helmet>
  );
};
