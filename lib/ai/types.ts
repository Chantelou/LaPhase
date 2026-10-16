export type AIActionType =
  | "chat"
  | "summary"
  | "quiz"
  | "flashcards"
  | "study_plan"
  | "explain";

export type AIProvider = "gemini" | "mistral" | "erick";

export interface AttachmentData {
  name: string;
  mimeType: string;
  size: number;
  base64: string;
}

export interface AIResponse<T = string | Record<string, unknown>> {
  success: boolean;
  provider?: AIProvider;
  content: T;
  rawText?: string;
  metadata?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SummaryOptions {
  text?: string;
  subject?: string;
  length: "short" | "medium" | "detailed";
  attachment?: AttachmentData;
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: "multiple_choice" | "true_false" | "open";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizOptions {
  text?: string;
  subject?: string;
  questionCount: 5 | 10 | 15 | 20;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "true_false" | "open";
}

export interface FlashcardItem {
  id: number;
  question: string;
  answer: string;
  hint?: string;
}

export interface FlashcardOptions {
  topicOrText: string;
  count?: number;
}

export interface StudyPlanDay {
  day: number;
  title: string;
  objectives: string[];
  tasks: string[];
  estimatedHours: number;
}

export interface StudyPlanOptions {
  subject: string;
  availableDays: number;
  studentLevel: "beginner" | "intermediate" | "advanced";
  goal: string;
}

export interface ExplainConceptOptions {
  concept?: string;
  level: "beginner" | "intermediate" | "advanced" | "explain_like_i_am_10";
  attachment?: AttachmentData;
}
