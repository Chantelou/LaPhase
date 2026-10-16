import { z } from "zod";

export const attachmentSchema = z.object({
  name: z.string().max(300),
  mimeType: z.string(),
  size: z.number(),
  base64: z.string(),
});

export const chatRequestSchema = z
  .object({
    message: z.string().max(15000).default(""),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })
      )
      .optional()
      .default([]),
    sessionId: z.string().optional(),
    attachment: attachmentSchema.optional(),
  })
  .refine((data) => data.message.trim().length > 0 || Boolean(data.attachment), {
    message: "Veuillez poser une question ou joindre un fichier (PDF, image)",
    path: ["message"],
  });

export const summaryRequestSchema = z
  .object({
    text: z.string().max(100000).optional(),
    subject: z.string().max(200).optional(),
    length: z.enum(["short", "medium", "detailed"]).default("medium"),
    sessionId: z.string().optional(),
    attachment: attachmentSchema.optional(),
  })
  .refine((data) => (data.text && data.text.trim().length >= 10) || Boolean(data.attachment), {
    message: "Veuillez saisir un texte ou téléverser un fichier de cours (PDF, image)",
    path: ["text"],
  });

export const quizRequestSchema = z.object({
  text: z.string().max(50000).optional(),
  subject: z.string().max(200).optional(),
  questionCount: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  type: z.enum(["multiple_choice", "true_false", "open"]).default("multiple_choice"),
  sessionId: z.string().optional(),
}).refine((data) => data.text || data.subject, {
  message: "Veuillez fournir soit un sujet, soit un texte source",
  path: ["subject"],
});

export const flashcardsRequestSchema = z.object({
  topicOrText: z.string().min(5, "Le sujet ou texte doit comporter au moins 5 caractères").max(30000),
  count: z.number().int().min(3).max(30).default(8),
  sessionId: z.string().optional(),
});

export const studyPlanRequestSchema = z.object({
  subject: z.string().min(2, "Le sujet est requis").max(200),
  availableDays: z.number().int().min(1).max(90).default(7),
  studentLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  goal: z.string().min(3, "L'objectif est requis").max(500),
  sessionId: z.string().optional(),
});

export const explainConceptSchema = z
  .object({
    concept: z.string().max(500).optional(),
    level: z.enum(["beginner", "intermediate", "advanced", "explain_like_i_am_10"]).default("beginner"),
    sessionId: z.string().optional(),
    attachment: attachmentSchema.optional(),
  })
  .refine((data) => (data.concept && data.concept.trim().length >= 2) || Boolean(data.attachment), {
    message: "Veuillez préciser un concept ou joindre un document à expliquer",
    path: ["concept"],
  });

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type SummaryRequest = z.infer<typeof summaryRequestSchema>;
export type QuizRequest = z.infer<typeof quizRequestSchema>;
export type FlashcardsRequest = z.infer<typeof flashcardsRequestSchema>;
export type StudyPlanRequest = z.infer<typeof studyPlanRequestSchema>;
export type ExplainConceptRequest = z.infer<typeof explainConceptSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
