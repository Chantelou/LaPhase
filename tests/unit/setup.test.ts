import { describe, it, expect } from "vitest";
import {
  chatRequestSchema,
  summaryRequestSchema,
  quizRequestSchema,
  studyPlanRequestSchema,
  registerSchema,
} from "../../lib/ai/schemas";
import { PROMPTS } from "../../lib/ai/prompts";

describe("Phase 1: Project Setup & Schemas Validation", () => {
  it("should validate a valid chat request", () => {
    const valid = {
      message: "Comment fonctionne la photosynthèse ?",
      history: [],
    };
    const result = chatRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject an empty chat message", () => {
    const invalid = { message: "" };
    const result = chatRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should validate summary request with length options", () => {
    const valid = {
      text: "La mécanique quantique est l'étude des particules à l'échelle atomique.",
      subject: "Physique",
      length: "short" as const,
    };
    const result = summaryRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should validate quiz schema requires subject or text", () => {
    const validWithSubject = {
      subject: "Histoire de France",
      questionCount: 5 as const,
      difficulty: "medium" as const,
      type: "multiple_choice" as const,
    };
    const result = quizRequestSchema.safeParse(validWithSubject);
    expect(result.success).toBe(true);

    const invalid = {
      questionCount: 5 as const,
      difficulty: "medium" as const,
      type: "multiple_choice" as const,
    };
    const resultInvalid = quizRequestSchema.safeParse(invalid);
    expect(resultInvalid.success).toBe(false);
  });

  it("should validate user registration data", () => {
    const valid = {
      name: "Jean Dupont",
      email: "jean.dupont@test.fr",
      password: "secure_password_123",
    };
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalidEmail = {
      name: "Jean",
      email: "not-an-email",
      password: "123",
    };
    const resultInvalid = registerSchema.safeParse(invalidEmail);
    expect(resultInvalid.success).toBe(false);
  });

  it("should generate prompts with correct structured placeholders", () => {
    const prompt = PROMPTS.summary({
      text: "Introduction au machine learning et aux réseaux de neurones.",
      subject: "Informatique",
      length: "medium",
    });
    expect(prompt).toContain("Sujet / Matière : Informatique");
    expect(prompt).toContain("Introduction au machine learning");
  });
});
