import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { isDatabaseConnected, connectToDatabase } from "./lib/mongodb";
import { executeAIRequest } from "./lib/ai/ai-service";
import { PROMPTS } from "./lib/ai/prompts";
import {
  chatRequestSchema,
  summaryRequestSchema,
  quizRequestSchema,
  flashcardsRequestSchema,
  studyPlanRequestSchema,
  explainConceptSchema,
} from "./lib/ai/schemas";
import {
  saveGeneratedContent,
  listGeneratedContent,
  deleteGeneratedContent,
  getUserStats,
} from "./lib/storage";
import {
  registerUser,
  authenticateUser,
  verifyToken,
  findUserById,
} from "./lib/auth";
import { resolveMediaForTopic } from "./lib/ai/media";

dotenv.config();

const PORT = 3000;

function formatZodError(err: any): string {
  if (err?.issues && Array.isArray(err.issues) && err.issues.length > 0) {
    return err.issues[0].message;
  }
  return err?.message || "Données de formulaire invalides";
}

function getUserIdFromRequest(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      return decoded.id;
    }
  }

  const customHeader = req.headers["x-user-id"];
  if (customHeader && typeof customHeader === "string") {
    return customHeader;
  }

  if (req.body && req.body.userId && typeof req.body.userId === "string") {
    return req.body.userId;
  }

  if (req.query && req.query.userId && typeof req.query.userId === "string") {
    return req.query.userId;
  }

  return "student_guest";
}

// Attempt non-blocking DB connection in the background if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
  connectToDatabase().catch((e) => {
    console.log("ℹ️ MongoDB initial connection notice:", e.message);
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- HEALTH CHECK ---
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Erick AI Study Assistant",
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: isDatabaseConnected(),
        configured: Boolean(process.env.MONGODB_URI),
      },
      erickAI: {
        ready: true,
        voiceRecognition: true,
        multimedia: true,
      },
    });
  });

  // --- AUTHENTICATION ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_NAME", message: "Le nom doit contenir au moins 2 caractères." },
        });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_EMAIL", message: "Veuillez fournir une adresse email valide." },
        });
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
          success: false,
          error: { code: "WEAK_PASSWORD", message: "Le mot de passe doit comporter au moins 6 caractères." },
        });
      }

      const result = await registerUser(name, email, password);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: { code: "REGISTRATION_FAILED", message: (err as Error).message },
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: { code: "MISSING_CREDENTIALS", message: "Email et mot de passe requis." },
        });
      }

      const result = await authenticateUser(email, password);
      res.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        error: { code: "LOGIN_FAILED", message: (err as Error).message },
      });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Token d'authentification manquant." },
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Session expirée ou invalide." },
      });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "Utilisateur introuvable." },
      });
    }

    res.json({
      success: true,
      user,
    });
  });

  // --- MULTIMEDIA ENDPOINT (VIDEOS & DIAGRAMS) ---
  app.get("/api/ai/media", (req, res) => {
    const topic = (req.query.topic as string) || (req.query.q as string) || "Général";
    const media = resolveMediaForTopic(topic);
    res.json({
      success: true,
      topic,
      media,
    });
  });

  // --- 1. AI CHAT ---
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const parsed = chatRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: formatZodError(parsed.error),
          },
        });
      }

      const { message, history, sessionId, attachment } = parsed.data;
      const historyContext =
        history && history.length > 0
          ? "\nHistorique de la discussion :\n" +
            history.map((m) => `${m.role === "user" ? "Étudiant" : "Erick"} : ${m.content}`).join("\n") +
            "\n"
          : "";

      const attachmentInfo = attachment
        ? `\n[Fichier joint analysé : "${attachment.name}" (${attachment.mimeType}, ${(attachment.size / 1024).toFixed(1)} Ko)]\n`
        : "";

      const prompt = `${historyContext}${attachmentInfo}Étudiant : ${message || "Analyse ce document de cours et explique-moi en détail son contenu."}\nErick :`;

      const aiResult = await executeAIRequest<string>({
        prompt,
        systemInstruction: PROMPTS.chatSystem,
        expectJson: false,
        attachment,
      });

      if (!aiResult.success) {
        return res.status(500).json(aiResult);
      }

      // Automatically attach relevant educational YouTube videos and explanatory diagrams
      const topicForMedia = message || attachment?.name || "Apprentissage";
      const media = resolveMediaForTopic(topicForMedia, aiResult.content);

      const userId = getUserIdFromRequest(req);

      // Save as student interaction if meaningful or if attachment was analyzed
      if (attachment || (message && message.length > 15)) {
        await saveGeneratedContent({
          userId,
          sessionId,
          type: "explanation",
          title: attachment
            ? `Analyse document : ${attachment.name}`
            : `Discussion : ${message.substring(0, 40)}${message.length > 40 ? "..." : ""}`,
          input: message || (attachment ? `Document : ${attachment.name}` : "Question"),
          content: aiResult.content,
          provider: "erick",
          metadata: {
            hasAttachment: Boolean(attachment),
            attachmentName: attachment?.name,
            attachmentType: attachment?.mimeType,
          },
        });
      }

      res.json({
        success: true,
        provider: "erick",
        message: aiResult.content,
        media,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Chat route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 2. SUMMARY GENERATOR ---
  app.post("/api/ai/summary", async (req, res) => {
    try {
      const parsed = summaryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) },
        });
      }

      const prompt = PROMPTS.summary(parsed.data);
      const aiResult = await executeAIRequest<string>({
        prompt,
        expectJson: false,
        attachment: parsed.data.attachment,
      });

      if (!aiResult.success) {
        return res.status(500).json(aiResult);
      }

      const userId = getUserIdFromRequest(req);
      const inputDisplay = parsed.data.attachment
        ? `Document : ${parsed.data.attachment.name}`
        : parsed.data.text
        ? parsed.data.text.substring(0, 300) + (parsed.data.text.length > 300 ? "..." : "")
        : "Résumé";

      const title = parsed.data.subject
        ? `Résumé : ${parsed.data.subject}`
        : parsed.data.attachment
        ? `Résumé : ${parsed.data.attachment.name}`
        : "Résumé de cours";

      const saved = await saveGeneratedContent({
        userId,
        sessionId: parsed.data.sessionId,
        type: "summary",
        title,
        input: inputDisplay,
        content: aiResult.content,
        provider: "erick",
        metadata: {
          length: parsed.data.length,
          subject: parsed.data.subject,
          hasAttachment: Boolean(parsed.data.attachment),
          attachmentName: parsed.data.attachment?.name,
        },
      });

      res.json({
        success: true,
        provider: "erick",
        summary: aiResult.content,
        savedItem: saved,
      });
    } catch (err) {
      console.error("Summary route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 3. QUIZ GENERATOR ---
  app.post("/api/ai/quiz", async (req, res) => {
    try {
      const parsed = quizRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) },
        });
      }

      const prompt = PROMPTS.quiz(parsed.data);
      const aiResult = await executeAIRequest<unknown>({
        prompt,
        expectJson: true,
      });

      if (!aiResult.success) {
        return res.status(500).json(aiResult);
      }

      const userId = getUserIdFromRequest(req);
      const saved = await saveGeneratedContent({
        userId,
        sessionId: parsed.data.sessionId,
        type: "quiz",
        title: parsed.data.subject ? `Quiz : ${parsed.data.subject}` : "Quiz d'auto-évaluation",
        input: parsed.data.subject || (parsed.data.text ? parsed.data.text.substring(0, 150) : "Quiz"),
        content: JSON.stringify(aiResult.content),
        provider: "erick",
        metadata: {
          difficulty: parsed.data.difficulty,
          questionCount: parsed.data.questionCount,
          type: parsed.data.type,
        },
      });

      res.json({
        success: true,
        provider: "erick",
        questions: aiResult.content,
        savedItem: saved,
      });
    } catch (err) {
      console.error("Quiz route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 4. FLASHCARDS GENERATOR ---
  app.post("/api/ai/flashcards", async (req, res) => {
    try {
      const parsed = flashcardsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) },
        });
      }

      const prompt = PROMPTS.flashcards(parsed.data);
      const aiResult = await executeAIRequest<unknown>({
        prompt,
        expectJson: true,
      });

      if (!aiResult.success) {
        return res.status(500).json(aiResult);
      }

      const userId = getUserIdFromRequest(req);
      const saved = await saveGeneratedContent({
        userId,
        sessionId: parsed.data.sessionId,
        type: "flashcards",
        title: `Flashcards : ${parsed.data.topicOrText.substring(0, 40)}`,
        input: parsed.data.topicOrText.substring(0, 200),
        content: JSON.stringify(aiResult.content),
        provider: "erick",
        metadata: { count: parsed.data.count },
      });

      res.json({
        success: true,
        provider: "erick",
        flashcards: aiResult.content,
        savedItem: saved,
      });
    } catch (err) {
      console.error("Flashcards route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 5. STUDY PLAN GENERATOR ---
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const parsed = studyPlanRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) },
        });
      }

      const prompt = PROMPTS.studyPlan(parsed.data);
      const aiResult = await executeAIRequest<unknown>({
        prompt,
        expectJson: true,
      });

      if (!aiResult.success) {
        return res.status(500).json(aiResult);
      }

      const userId = getUserIdFromRequest(req);
      const saved = await saveGeneratedContent({
        userId,
        sessionId: parsed.data.sessionId,
        type: "study_plan",
        title: `Plan : ${parsed.data.subject} (${parsed.data.availableDays} jours)`,
        input: `Objectif : ${parsed.data.goal} - Niveau : ${parsed.data.studentLevel}`,
        content: JSON.stringify(aiResult.content),
        provider: "erick",
        metadata: {
          availableDays: parsed.data.availableDays,
          studentLevel: parsed.data.studentLevel,
          goal: parsed.data.goal,
        },
      });

      res.json({
        success: true,
        provider: "erick",
        plan: aiResult.content,
        savedItem: saved,
      });
    } catch (err) {
      console.error("Study plan route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 6. EXPLAIN CONCEPT ---
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const parsed = explainConceptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) },
        });
      }

      const prompt = PROMPTS.explainConcept(parsed.data);
      const aiResult = await executeAIRequest<string>({
        prompt,
        expectJson: false,
        attachment: parsed.data.attachment,
      });

      if (!aiResult.success) {
        return res.status(500).json(aiResult);
      }

      const levelLabels: Record<string, string> = {
        explain_like_i_am_10: "Explain Like I'm 10",
        beginner: "Débutant",
        intermediate: "Intermédiaire",
        advanced: "Avancé",
      };

      const titleName =
        parsed.data.concept || (parsed.data.attachment ? parsed.data.attachment.name : "Concept");

      const userId = getUserIdFromRequest(req);
      const saved = await saveGeneratedContent({
        userId,
        sessionId: parsed.data.sessionId,
        type: "explanation",
        title: `Concept : ${titleName} (${levelLabels[parsed.data.level] || parsed.data.level})`,
        input: parsed.data.concept || (parsed.data.attachment ? `Document : ${parsed.data.attachment.name}` : ""),
        content: aiResult.content,
        provider: "erick",
        metadata: {
          level: parsed.data.level,
          hasAttachment: Boolean(parsed.data.attachment),
          attachmentName: parsed.data.attachment?.name,
        },
      });

      const media = resolveMediaForTopic(titleName, aiResult.content);

      res.json({
        success: true,
        provider: "erick",
        explanation: aiResult.content,
        media,
        savedItem: saved,
      });
    } catch (err) {
      console.error("Explain route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 7. STUDY HISTORY ---
  app.get("/api/history", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const items = await listGeneratedContent(userId);
      res.json({ success: true, items });
    } catch (err) {
      console.error("History list error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const userId = getUserIdFromRequest(req);
      const success = await deleteGeneratedContent(id, userId);
      res.json({ success });
    } catch (err) {
      console.error("History delete error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- 8. STUDENT REAL-TIME STATS ---
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const stats = await getUserStats(userId);
      res.json({ success: true, stats });
    } catch (err) {
      console.error("Stats route error:", err);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: (err as Error).message },
      });
    }
  });

  // --- FRONTEND INTEGRATION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(` AI Study Assistant running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
