import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, canonicalUrl, ogImage, type = 'website', jsonLd, isHome = false, breadcrumbs = [] }) => {
  const siteUrl = 'https://www.antilabs.com';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullOgImage = ogImage ? `${siteUrl}${ogImage}` : `${siteUrl}/logo.png`;

  const finalTitle = isHome 
    ? "AntiLabs | Web Development, AI Solutions & Digital Innovation"
    : title 
      ? `${title} | AntiLabs` 
      : "AntiLabs | Web Development, AI Solutions & Digital Innovation";

  const finalDescription = description || "AntiLabs is a leading technology company specializing in web development, AI solutions, software engineering, and digital transformation for modern businesses.";

  const schemas = [];

  // 1. Organization Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AntiLabs",
    "url": "https://www.antilabs.com",
    "logo": "https://www.antilabs.com/logo.png",
    "sameAs": [
      "https://twitter.com/antilabs",
      "https://www.linkedin.com/company/antilabs",
      "https://github.com/antilabs"
    ]
  });

  // 2. WebSite Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AntiLabs",
    "url": "https://www.antilabs.com/"
  });

  // 3. Brand Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "AntiLabs"
  });

  // 4. Breadcrumb Schema (if provided)
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `${siteUrl}${crumb.url}`
      }))
    });
  }

  // Use custom jsonLd if provided, else use generated schemas array
  const finalJsonLd = jsonLd ? jsonLd : schemas;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:image" content={fullOgImage} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
