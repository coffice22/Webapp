export const seoData = {
  home: {
    title: "Coffice - Espace de Coworking Premium a Alger | Mohammadia Mall",
    description:
      "Coffice, espace de coworking moderne au Mohammadia Mall, Alger. Bureaux prives, salles de reunion, domiciliation d'entreprise. WiFi haut debit, kitchenette, terrasse. Reservez des maintenant.",
    keywords: [
      "coworking alger",
      "espace de travail alger",
      "bureau partage alger",
      "domiciliation entreprise algerie",
      "location bureau alger",
      "salle de reunion alger",
      "mohammadia mall coworking",
      "bureau flexible alger",
      "espace professionnel alger",
    ],
  },
  spaces: {
    title:
      "Nos Espaces de Travail - Coffice Alger | Bureaux et Salles de Reunion",
    description:
      "Decouvrez nos espaces de coworking: 2 box de 4 places, 1 box de 3 places, open space 12 places avec postes informatiques, salle de reunion avec terrasse. Mohammadia Mall, 4eme etage.",
    keywords: [
      "bureaux alger",
      "salle de reunion alger",
      "espace coworking mohammadia",
      "box prive alger",
      "open space alger",
      "bureau equipe alger",
    ],
  },
  pricing: {
    title: "Tarifs Coworking Alger - Coffice | Formules Flexibles",
    description:
      "Tarifs competitifs pour votre espace de travail a Alger. Formules a l'heure, journee ou mois. Domiciliation a partir de 12 000 DA/mois. Devis gratuit.",
    keywords: [
      "prix coworking alger",
      "tarif bureau alger",
      "abonnement coworking algerie",
      "location bureau prix alger",
      "domiciliation tarif algerie",
    ],
  },
  about: {
    title: "A Propos de Coffice - Coworking Alger | Notre Histoire",
    description:
      "Coffice est un espace de coworking nouvelle generation situe au Mohammadia Mall, Alger. Dedie aux entrepreneurs, freelances et entreprises en quete de flexibilite.",
    keywords: [
      "coworking alger histoire",
      "espace travail algerie",
      "coffice alger",
      "coworking mohammadia mall",
    ],
  },
  domiciliation: {
    title: "Domiciliation d'Entreprise a Alger - Coffice | Adresse Commerciale",
    description:
      "Domiciliez votre entreprise au Mohammadia Mall, Alger. Adresse prestigieuse, reception courrier, assistance administrative. A partir de 12 000 DA/mois. CNRC au 5eme etage.",
    keywords: [
      "domiciliation entreprise alger",
      "adresse commerciale algerie",
      "siege social alger",
      "domiciliation societe algerie",
      "creation entreprise alger",
    ],
  },
};

export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://coffice.dz/#organization",
    name: "Coffice",
    alternateName: "Coffice Coworking Alger",
    description:
      "Espace de coworking moderne a Alger avec bureaux prives, salles de reunion, domiciliation d'entreprise et services professionnels.",
    url: "https://coffice.dz",
    telephone: "+213-XXX-XXX-XXX",
    email: "contact@coffice.dz",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mohammadia Mall, 4eme etage, Bureau 1178",
      addressLocality: "Alger",
      addressRegion: "Alger",
      postalCode: "16000",
      addressCountry: "DZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.7538,
      longitude: 3.0588,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$",
    image: "https://coffice.dz/espace-coworking.jpeg",
    sameAs: [
      "https://www.facebook.com/coffice.dz",
      "https://www.instagram.com/coffice.dz",
      "https://www.linkedin.com/company/coffice-dz",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services Coffice",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Espace Coworking",
            description: "Acces a nos espaces de travail partages",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bureau Prive",
            description: "Box prives de 3 a 4 places",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Salle de Reunion",
            description: "Salle de reunion equipee avec terrasse",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Domiciliation",
            description: "Domiciliation d'entreprise avec adresse commerciale",
          },
          price: "12000",
          priceCurrency: "DZD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "12000",
            priceCurrency: "DZD",
            unitText: "mois",
          },
        },
      ],
    },
  },
  faq: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Ou se trouve Coffice a Alger?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Coffice est situe au Mohammadia Mall, 4eme etage, Bureau 1178 a Alger. Facilement accessible et proche du CNRC (5eme etage).",
        },
      },
      {
        "@type": "Question",
        name: "Quels sont les tarifs de domiciliation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La domiciliation d'entreprise commence a 12 000 DA par mois. Les contrats sont de 6 mois ou 1 an avec une reduction de 10% pour l'engagement annuel.",
        },
      },
      {
        "@type": "Question",
        name: "Quels espaces sont disponibles chez Coffice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nous disposons de 2 box de 4 places, 1 box de 3 places, 1 open space de 12 places avec 2 postes informatiques puissants, et 1 salle de reunion avec terrasse.",
        },
      },
      {
        "@type": "Question",
        name: "Quels services sont inclus?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nos services incluent: WiFi haut debit, kitchenette equipee, reception du courrier, assistance administrative, acces a la salle de reunion (selon formule).",
        },
      },
      {
        "@type": "Question",
        name: "Comment reserver un espace?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Vous pouvez reserver directement sur notre site web en creant un compte, ou nous contacter par telephone ou email. Les reservations sont confirmees sous 24h.",
        },
      },
    ],
  },
};

export const updatePageTitle = (title: string) => {
  document.title = title;
};

export const updateMetaDescription = (description: string) => {
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", description);
};

export const updateMetaKeywords = (keywords: string[]) => {
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement("meta");
    metaKeywords.setAttribute("name", "keywords");
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute("content", keywords.join(", "));
};

export const addCanonicalLink = (url: string) => {
  let canonicalLink = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute("href", url);
};

export const updateOpenGraphTags = (data: {
  title: string;
  description: string;
  url?: string;
  image?: string;
}) => {
  const ogTags = [
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Coffice" },
    { property: "og:locale", content: "fr_DZ" },
  ];

  if (data.url) {
    ogTags.push({ property: "og:url", content: data.url });
  }
  if (data.image) {
    ogTags.push({ property: "og:image", content: data.image });
  }

  ogTags.forEach(({ property, content }) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("property", property);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  });
};

export const updateTwitterTags = (data: {
  title: string;
  description: string;
  image?: string;
}) => {
  const twitterTags = [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: data.title },
    { name: "twitter:description", content: data.description },
  ];

  if (data.image) {
    twitterTags.push({ name: "twitter:image", content: data.image });
  }

  twitterTags.forEach(({ name, content }) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  });
};

export const injectStructuredData = (data: object) => {
  const existingScript = document.querySelector(
    'script[type="application/ld+json"][data-seo="true"]',
  );
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo", "true");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};
