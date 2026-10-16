import {
  QuizOptions,
  SummaryOptions,
  StudyPlanOptions,
  ExplainConceptOptions,
  FlashcardOptions,
} from "./types";

export const PROMPTS = {
  chatSystem: `Tu es Erick AI (ou simplement Erick), le tuteur et assistant pédagogique d'élite dédié à l'étudiant.
Ta mission est d'aider les étudiants à apprendre, réviser, débloquer des incompréhensions et réussir tous leurs examens.
Adopte un ton bienveillant, clair, rigoureux, chaleureux et stimulant.
Tu ne dois JAMAIS mentionner Gemini, Mistral, OpenAI ou des modèles d'IA techniques. Tu es uniquement Erick AI, leur mentor d'étude personnel.
Pour les étudiants qui ont des difficultés de lecture ou d'écriture, formule tes explications de manière claire, aérée et accessible.
Utilise des exemples concrets du quotidien, structure tes réponses avec du Markdown soigné, des puces et des étapes numérotées.
Si l'étudiant pose une question sur du code, des maths ou de la physique, guide-le pas à pas sans le noyer sous le jargon.`,

  summary: (opts: SummaryOptions): string => {
    const lengthInstructions = {
      short: "un résumé concis et synthétique (environ 3 à 5 points clés essentiels).",
      medium: "un résumé équilibré et structuré avec contexte, points clés et notions à retenir.",
      detailed: "un résumé approfondi et exhaustif avec structure claire, définitions clés, points essentiels et synthèse récapitulative.",
    };

    const docContext = opts.attachment
      ? `\nUn document de cours a été fourni : "${opts.attachment.name}" (${opts.attachment.mimeType}). Analyse attentivement son contenu complet (pages du PDF, schémas, formules, textes).\n`
      : "";

    return `Tu es un expert pédagogique en synthèse de cours.${docContext}
${opts.subject ? `Sujet / Matière : ${opts.subject}\n` : ""}
Longueur demandée : ${lengthInstructions[opts.length]}
${opts.text ? `\nTexte source additionnel :\n"""\n${opts.text}\n"""\n` : ""}

Génère un résumé pédagogique de haute qualité, parfaitement formaté en Markdown :
- Titre clair et engageant
- Contexte et vue d'ensemble du document / cours
- Notions et concepts cardinaux
- Points à retenir impérativement pour les examens
- Questions types de révision avec réponses`;
  },

  quiz: (opts: QuizOptions): string => {
    return `Tu es un professeur créateur d'évaluations formatives.
Génère un quiz de ${opts.questionCount} questions de difficulté "${opts.difficulty}" au format "${opts.type}".
${opts.subject ? `Sujet : ${opts.subject}\n` : ""}
${opts.text ? `Source documentaire :\n"""\n${opts.text}\n"""\n` : ""}

Tu DOIS impérativement répondre UNIQUEMENT par un JSON valide respectant strictement ce schéma (aucun texte avant ou après, pas de balises markdown) :
[
  {
    "id": 1,
    "question": "Énoncé précis de la question",
    "type": "${opts.type}",
    "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
    "correctAnswer": "Choix A",
    "explanation": "Explication pédagogique détaillée justifiant la bonne réponse."
  }
]
Pour le type "true_false", "options" doit valoir ["Vrai", "Faux"] et "correctAnswer" doit être "Vrai" ou "Faux".
Pour le type "open", "options" peut être vide ou omis, et "correctAnswer" est la réponse type attendue.`;
  },

  flashcards: (opts: FlashcardOptions): string => {
    const count = opts.count || 8;
    return `Tu es un expert en mémorisation active et répétition espacée.
Crée ${count} flashcards de révision efficaces à partir du contenu suivant :
"""
${opts.topicOrText}
"""

Tu DOIS impérativement répondre UNIQUEMENT par un JSON valide sans texte additionnel :
[
  {
    "id": 1,
    "question": "Question claire, ciblée et stimulante",
    "answer": "Réponse précise, synthétique et facile à mémoriser",
    "hint": "Indice facultatif pour guider la réflexion"
  }
]`;
  },

  studyPlan: (opts: StudyPlanOptions): string => {
    return `Tu es un coach académique certifié en méthodologie de travail.
Élabore un plan de révision complet et progressif pour un étudiant :
- Matière / Sujet : ${opts.subject}
- Durée disponible : ${opts.availableDays} jours
- Niveau de l'étudiant : ${opts.studentLevel}
- Objectif visé : ${opts.goal}

Tu DOIS impérativement répondre UNIQUEMENT par un JSON valide respectant ce format :
{
  "subject": "${opts.subject}",
  "totalDays": ${opts.availableDays},
  "summary": "Courte introduction motivante",
  "days": [
    {
      "day": 1,
      "title": "Titre du thème du jour",
      "objectives": ["Objectif 1", "Objectif 2"],
      "tasks": ["Action concrète 1", "Action concrète 2"],
      "estimatedHours": 2
    }
  ],
  "recommendations": [
    "Conseil méthodologique 1",
    "Conseil méthodologique 2"
  ]
}`;
  },

  explainConcept: (opts: ExplainConceptOptions): string => {
    const levelGuide = {
      explain_like_i_am_10:
        "Explique comme si l'étudiant avait 10 ans. Utilise une métaphore simple du quotidien, des termes simples et un ton captivant.",
      beginner:
        "Niveau Débutant : Fournis une explication progressive sans jargon excessif, avec des définitions claires et des exemples pratiques.",
      intermediate:
        "Niveau Intermédiaire : Fournis une explication technique rigoureuse, abordant les mécanismes fondamentaux, cas d'usage et pièges fréquents.",
      advanced:
        "Niveau Avancé : Analyse approfondie, nuances théoriques, cas limites, performances et perspectives d'architecture.",
    };

    const docContext = opts.attachment
      ? `\nUn document joint a été fourni par l'étudiant : "${opts.attachment.name}" (${opts.attachment.mimeType}). Analyse attentivement son contenu complet (schémas, notes manuscrites ou imprimées, formules, théorèmes, exercices).\n`
      : "";

    const target = opts.concept || (opts.attachment ? `le contenu et les notions du document joint (${opts.attachment.name})` : "ce sujet");

    return `Tu es un professeur pédagogue d'exception.${docContext}
Explique la notion ou le document suivant : "${target}".
Directives de niveau : ${levelGuide[opts.level]}

Structure ta réponse en Markdown propre :
1. Définition intuitive en une phrase
2. Métaphore / Analogie parlante du quotidien
3. Comment ça fonctionne (étapes clés, mécanismes et démonstrations pas à pas)
4. Exemple d'application concret extrait ou lié au document
5. Les 3 erreurs courantes à éviter
6. Question d'auto-évaluation pour tester la compréhension`;
  },
};
