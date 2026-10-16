import { describe, it, expect } from "vitest";
import { extractJsonFromText } from "../../lib/ai/ai-service";
import {
  flashcardsRequestSchema,
  explainConceptSchema,
  studyPlanRequestSchema,
} from "../../lib/ai/schemas";
import {
  saveGeneratedContent,
  listGeneratedContent,
  deleteGeneratedContent,
} from "../../lib/storage";

describe("Phase 2 & 3: AI Service, Storage & Tool Schemas", () => {
  it("should extract JSON correctly from markdown fenced blocks", () => {
    const rawMarkdown = "Voici vos questions :\n```json\n[{\"question\": \"Q1\", \"correctAnswer\": \"A\"}]\n```\nBon courage !";
    const extracted = extractJsonFromText(rawMarkdown);
    expect(extracted).toEqual([{ question: "Q1", correctAnswer: "A" }]);
  });

  it("should validate flashcard request parameters", () => {
    const valid = {
      topicOrText: "Formules de trigonométrie",
      count: 5,
    };
    const result = flashcardsRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = {
      topicOrText: "",
      count: 0,
    };
    const resultInvalid = flashcardsRequestSchema.safeParse(invalid);
    expect(resultInvalid.success).toBe(false);
  });

  it("should validate concept explanation schema with level", () => {
    const valid = {
      concept: "L'entropie thermodynamique",
      level: "explain_like_i_am_10" as const,
    };
    const result = explainConceptSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should validate study plan request with day bounds", () => {
    const valid = {
      subject: "Microéconomie",
      goal: "Partiel de fin de semestre",
      availableDays: 7,
      studentLevel: "intermediate" as const,
    };
    const result = studyPlanRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should save and retrieve study items in persistence store", async () => {
    const saved = await saveGeneratedContent({
      userId: "test_student",
      type: "summary",
      title: "Test Résumé",
      input: "Contenu test",
      content: "# Résumé généré",
      provider: "gemini",
    });

    expect(saved._id).toBeDefined();
    expect(saved.title).toBe("Test Résumé");

    const list = await listGeneratedContent("test_student");
    expect(list.some((item) => item.title === "Test Résumé")).toBe(true);

    const deleted = await deleteGeneratedContent(saved._id, "test_student");
    expect(deleted).toBe(true);
  });
});
