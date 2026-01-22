export const seoData = {
  home: {
    title: "Coffice - Espace de Coworking à Alger",
    description:
      "Découvrez Coffice, votre espace de coworking moderne à Alger. Bureaux flexibles, salles de réunion et domiciliation d'entreprise.",
    keywords: [
      "coworking alger",
      "espace de travail",
      "bureau partagé",
      "domiciliation algérie",
    ],
  },
  spaces: {
    title: "Nos Espaces - Coffice",
    description:
      "Explorez nos espaces de travail: bureaux privés, zones ouvertes, salles de réunion équipées.",
    keywords: ["bureaux alger", "salle de réunion", "espace coworking"],
  },
  pricing: {
    title: "Tarifs - Coffice",
    description:
      "Découvrez nos formules d'abonnement flexibles adaptées à vos besoins.",
    keywords: ["prix coworking alger", "tarif bureau", "abonnement coworking"],
  },
  about: {
    title: "À Propos - Coffice",
    description:
      "Coffice est un espace de coworking moderne à Alger, dédié aux entrepreneurs et freelances.",
    keywords: ["coworking alger", "espace travail algérie"],
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
