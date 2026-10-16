export interface EducationalVideo {
  id: string;
  title: string;
  channel: string;
  duration?: string;
  embedUrl: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  description: string;
}

export interface EducationalImage {
  id: string;
  title: string;
  url: string;
  caption: string;
  category: string;
}

// Curated high quality educational videos on classic study topics
const CURATED_VIDEOS: Record<string, EducationalVideo[]> = {
  bernoulli: [
    {
      id: "dW8iQz1m8v0",
      title: "Le théorème de Bernoulli expliqué simplement",
      channel: "Science Étonnante / Physique Facile",
      duration: "6:45",
      embedUrl: "https://www.youtube.com/embed/dW8iQz1m8v0",
      youtubeUrl: "https://www.youtube.com/watch?v=dW8iQz1m8v0",
      thumbnailUrl: "https://images.unsplash.com/photo-1517976487507-5b3b4b45f942?w=600&auto=format&fit=crop&q=80",
      description: "Comprendre pourquoi la pression diminue quand la vitesse d'un fluide augmente et comment volent les avions.",
    },
  ],
  gravite: [
    {
      id: "77m_J_U6c6c",
      title: "La gravitation universelle et Newton",
      channel: "L'Esprit Sorcier",
      duration: "8:20",
      embedUrl: "https://www.youtube.com/embed/77m_J_U6c6c",
      youtubeUrl: "https://www.youtube.com/watch?v=77m_J_U6c6c",
      thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      description: "Pourquoi les objets tombent-ils vers le bas et comment la Lune orbite-t-elle autour de la Terre ?",
    },
  ],
  immunitaire: [
    {
      id: "zQGOcOUBi6s",
      title: "Le Système Immunitaire : Comment ton corps se défend",
      channel: "Kurzgesagt (Français)",
      duration: "10:15",
      embedUrl: "https://www.youtube.com/embed/zQGOcOUBi6s",
      youtubeUrl: "https://www.youtube.com/watch?v=zQGOcOUBi6s",
      thumbnailUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80",
      description: "Les lymphocytes B, T, macrophages et la réponse immunitaire adaptative détaillée avec animations.",
    },
  ],
  mitose: [
    {
      id: "f-ldPgEfAHI",
      title: "La mitose et le cycle cellulaire pas à pas",
      channel: "Biologie Khan Academy",
      duration: "7:50",
      embedUrl: "https://www.youtube.com/embed/f-ldPgEfAHI",
      youtubeUrl: "https://www.youtube.com/watch?v=f-ldPgEfAHI",
      thumbnailUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80",
      description: "Prophase, métaphase, anaphase et télophase illustrées étape par étape pour les révisions.",
    },
  ],
  trigonometrie: [
    {
      id: "PUB0TaZ7bhA",
      title: "Le cercle trigonométrique en 5 minutes chrono",
      channel: "Mathrix",
      duration: "5:30",
      embedUrl: "https://www.youtube.com/embed/PUB0TaZ7bhA",
      youtubeUrl: "https://www.youtube.com/watch?v=PUB0TaZ7bhA",
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
      description: "Sinus, cosinus, tangente et radians sur le cercle trigonométrique sans apprendre par cœur.",
    },
  ],
  guerre: [
    {
      id: "4k6_Z3LhG9U",
      title: "La Seconde Guerre Mondiale : Résumé des grandes phases",
      channel: "Nota Bene",
      duration: "12:10",
      embedUrl: "https://www.youtube.com/embed/4k6_Z3LhG9U",
      youtubeUrl: "https://www.youtube.com/watch?v=4k6_Z3LhG9U",
      thumbnailUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
      description: "Chronologie claire : invasion de la Pologne, blitzkrieg, tournant de 1942 et capitulation en 1945.",
    },
  ],
  economie: [
    {
      id: "g9aDiznZqA0",
      title: "L'offre et la demande expliquées simplement",
      channel: "Dessine-moi l'éco",
      duration: "4:20",
      embedUrl: "https://www.youtube.com/embed/g9aDiznZqA0",
      youtubeUrl: "https://www.youtube.com/watch?v=g9aDiznZqA0",
      thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
      description: "Le mécanisme des prix de marché, la rareté et les élasticités en microéconomie.",
    },
  ],
};

// Curated educational schemas and diagrams
const CURATED_IMAGES: Record<string, EducationalImage[]> = {
  bernoulli: [
    {
      id: "img_bernoulli",
      title: "Effet Venturi et Théorème de Bernoulli",
      url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
      caption: "Schéma d'écoulement d'un fluide dans un rétrécissement : vitesse accrue et dépression associée.",
      category: "Physique des fluides",
    },
  ],
  gravite: [
    {
      id: "img_gravite",
      title: "Courbure de l'espace-temps et gravitation",
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      caption: "Modélisation de l'attraction gravitationnelle et orbites des corps célestes autour d'une masse centrale.",
      category: "Astrophysique",
    },
  ],
  immunitaire: [
    {
      id: "img_immunitaire",
      title: "Réponse immunitaire et anticorps",
      url: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format&fit=crop&q=80",
      caption: "Structure schématique des anticorps neutralisant les antigènes viraux et bactériens.",
      category: "Immunologie",
    },
  ],
  mitose: [
    {
      id: "img_mitose",
      title: "Phases de la division cellulaire",
      url: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80",
      caption: "Alignement des chromosomes sur la plaque équatoriale et séparation des chromatides sœurs.",
      category: "Biologie cellulaire",
    },
  ],
  trigonometrie: [
    {
      id: "img_trigo",
      title: "Cercle Trigonométrique et Fonctions",
      url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
      caption: "Représentation graphique de sin(x), cos(x) et tan(x) sur le cercle unitaire.",
      category: "Mathématiques",
    },
  ],
  guerre: [
    {
      id: "img_guerre",
      title: "Archives et cartes historiques 1939-1945",
      url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80",
      caption: "Cartographie des fronts européen et pacifique durant le second conflit mondial.",
      category: "Histoire",
    },
  ],
  economie: [
    {
      id: "img_eco",
      title: "Courbes d'Offre et de Demande",
      url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
      caption: "Point d'équilibre concurrentiel, surplus du consommateur et du producteur.",
      category: "Microéconomie",
    },
  ],
};

/**
 * Returns matching educational videos and images for any subject/query
 */
export function resolveMediaForTopic(topic: string, promptText?: string): {
  videos: EducationalVideo[];
  images: EducationalImage[];
} {
  const normalized = (topic + " " + (promptText || "")).toLowerCase();

  let matchedVideos: EducationalVideo[] = [];
  let matchedImages: EducationalImage[] = [];

  for (const [key, videos] of Object.entries(CURATED_VIDEOS)) {
    if (normalized.includes(key)) {
      matchedVideos.push(...videos);
    }
  }

  for (const [key, images] of Object.entries(CURATED_IMAGES)) {
    if (normalized.includes(key)) {
      matchedImages.push(...images);
    }
  }

  // If no exact keyword match, generate a dynamic educational YouTube embed & educational diagram
  if (matchedVideos.length === 0) {
    const cleanQuery = topic.trim().slice(0, 45);
    matchedVideos.push({
      id: "search_" + Date.now(),
      title: `Cours vidéo & explication : ${cleanQuery}`,
      channel: "Chaîne Éducative Partenaire (YouTube)",
      duration: "Vidéo pédagogique",
      embedUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cleanQuery + " cours explication")}`,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery + " cours etudiant")}`,
      thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
      description: `Sélection de vidéos explicatives recommandées par Erick AI sur le thème "${cleanQuery}".`,
    });
  }

  if (matchedImages.length === 0) {
    matchedImages.push({
      id: "img_gen_" + Date.now(),
      title: `Schéma conceptuel : ${topic.trim().slice(0, 45)}`,
      url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
      caption: `Illustration didactique et infographie de synthèse associée au concept de "${topic.trim()}".`,
      category: "Illustration d'étude",
    });
  }

  return {
    videos: matchedVideos.slice(0, 2),
    images: matchedImages.slice(0, 2),
  };
}
