import { GeneratedContent, IGeneratedContent } from "../models/GeneratedContent";
import { Message } from "../models/Message";
import { isDatabaseConnected } from "./mongodb";

export interface StoredItem {
  _id: string;
  userId: string;
  sessionId?: string;
  type: "summary" | "quiz" | "flashcards" | "study_plan" | "explanation";
  title: string;
  input: string;
  content: string;
  metadata: Record<string, unknown>;
  provider: "gemini" | "mistral" | "erick";
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentStats {
  totalSessions: number;
  summariesCount: number;
  quizzesCompleted: number;
  flashcardsGenerated: number;
  flashcardsDecksCount: number;
  studyPlansCreated: number;
  explanationsCount: number;
  documentsAnalyzed: number;
  weeklyActivityCount: number;
  studyStreakDays: number;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }>;
}

const memoryItems: StoredItem[] = [];

export async function saveGeneratedContent(data: {
  userId: string;
  sessionId?: string;
  type: "summary" | "quiz" | "flashcards" | "study_plan" | "explanation";
  title: string;
  input: string;
  content: string;
  metadata?: Record<string, unknown>;
  provider?: "gemini" | "mistral" | "erick";
}): Promise<StoredItem> {
  const itemData: StoredItem = {
    _id: "mem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
    userId: data.userId || "anonymous",
    sessionId: data.sessionId,
    type: data.type,
    title: data.title,
    input: data.input,
    content: data.content,
    metadata: data.metadata || {},
    provider: data.provider || "erick",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDatabaseConnected()) {
    try {
      const doc: any = await GeneratedContent.create({
        userId: itemData.userId,
        sessionId: itemData.sessionId,
        type: itemData.type,
        title: itemData.title,
        input: itemData.input,
        content: itemData.content,
        metadata: itemData.metadata,
        provider: itemData.provider,
      });
      if (doc) {
        return {
          _id: doc._id.toString(),
          userId: doc.userId,
          sessionId: doc.sessionId,
          type: doc.type,
          title: doc.title,
          input: doc.input,
          content: doc.content,
          metadata: (doc.metadata as Record<string, unknown>) || {},
          provider: doc.provider,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
    } catch (e) {
      console.warn("Could not save to MongoDB, storing in memory fallback:", (e as Error).message);
    }
  }

  memoryItems.unshift(itemData);
  return itemData;
}

export async function listGeneratedContent(userId: string): Promise<StoredItem[]> {
  if (isDatabaseConnected()) {
    try {
      const docs = await GeneratedContent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      return docs.map((d) => ({
        _id: d._id.toString(),
        userId: d.userId,
        sessionId: d.sessionId,
        type: d.type,
        title: d.title,
        input: d.input,
        content: d.content,
        metadata: (d.metadata as Record<string, unknown>) || {},
        provider: d.provider,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
    } catch (e) {
      console.warn("Could not query MongoDB, falling back to memory:", (e as Error).message);
    }
  }

  return memoryItems.filter((m) => m.userId === userId);
}

export async function deleteGeneratedContent(id: string, userId: string): Promise<boolean> {
  if (isDatabaseConnected()) {
    try {
      const res = await GeneratedContent.deleteOne({ _id: id, userId });
      if (res.deletedCount > 0) return true;
    } catch (e) {
      console.warn("Could not delete from MongoDB, trying memory:", (e as Error).message);
    }
  }

  const idx = memoryItems.findIndex((m) => m._id === id && m.userId === userId);
  if (idx !== -1) {
    memoryItems.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getUserStats(userId: string): Promise<StudentStats> {
  const items = await listGeneratedContent(userId);

  const summaries = items.filter((i) => i.type === "summary");
  const quizzes = items.filter((i) => i.type === "quiz");
  const flashcardDecks = items.filter((i) => i.type === "flashcards");
  const studyPlans = items.filter((i) => i.type === "study_plan");
  const explanations = items.filter((i) => i.type === "explanation");

  let totalFlashcardCards = 0;
  for (const deck of flashcardDecks) {
    if (deck.metadata && typeof deck.metadata.count === "number") {
      totalFlashcardCards += deck.metadata.count;
    } else {
      try {
        const parsed = JSON.parse(deck.content);
        if (Array.isArray(parsed)) {
          totalFlashcardCards += parsed.length;
        } else {
          totalFlashcardCards += 8;
        }
      } catch {
        totalFlashcardCards += 8;
      }
    }
  }

  const documentsAnalyzed = items.filter(
    (i) => i.metadata && Boolean(i.metadata.hasAttachment || i.metadata.attachmentName)
  ).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyActivityCount = items.filter(
    (i) => new Date(i.createdAt).getTime() >= sevenDaysAgo.getTime()
  ).length;

  const activeDaysSet = new Set<string>();
  items.forEach((item) => {
    const d = new Date(item.createdAt);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    activeDaysSet.add(dayStr);
  });

  let streak = 0;
  const now = new Date();
  for (let d = 0; d < 60; d++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - d);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
    if (activeDaysSet.has(dateStr)) {
      streak++;
    } else {
      if (d === 0) continue;
      break;
    }
  }

  const recentActivities = items.slice(0, 5).map((i) => ({
    id: i._id,
    type: i.type,
    title: i.title,
    createdAt: new Date(i.createdAt).toISOString(),
  }));

  return {
    totalSessions: items.length,
    summariesCount: summaries.length,
    quizzesCompleted: quizzes.length,
    flashcardsGenerated: totalFlashcardCards,
    flashcardsDecksCount: flashcardDecks.length,
    studyPlansCreated: studyPlans.length,
    explanationsCount: explanations.length,
    documentsAnalyzed,
    weeklyActivityCount,
    studyStreakDays: streak,
    recentActivities,
  };
}
