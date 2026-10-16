export type StudyToolType =
  | "dashboard"
  | "chat"
  | "summary"
  | "quiz"
  | "flashcards"
  | "study-plan"
  | "explain"
  | "media"
  | "gmail"
  | "history"
  | "settings";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: number;
  modifiedTime?: string;
}

export interface TeacherEmail {
  id: string;
  threadId: string;
  from: string;
  senderName: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  isTeacher?: boolean;
  analysis?: {
    summary: string;
    keyPoints: string[];
    actionRequired?: string;
    deadline?: string;
  };
  suggestedReply?: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  title: string;
  description: string;
  imageUrl?: string;
  svgData?: string;
  tags?: string[];
  createdAt: string;
}

export interface GeneratedVideoClip {
  id: string;
  title: string;
  subject: string;
  summary: string;
  videoUrl?: string;
  youtubeId?: string;
  steps: Array<{ step: number; title: string; explanation: string; duration: string }>;
  createdAt: string;
}

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

export interface MediaPayload {
  videos?: EducationalVideo[];
  images?: EducationalImage[];
}

export interface AttachmentFile {
  name: string;
  mimeType: string;
  size: number;
  base64: string;
}

export interface HistoryItem {
  _id: string;
  type: "summary" | "quiz" | "flashcards" | "study_plan" | "explanation" | "chat";
  title: string;
  input: string;
  content: string;
  provider: "erick" | string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  media?: MediaPayload;
}

export interface DashboardStats {
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
