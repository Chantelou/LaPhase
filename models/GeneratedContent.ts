import mongoose, { Schema, Document, Model } from "mongoose";

export type ContentType =
  | "summary"
  | "quiz"
  | "flashcards"
  | "study_plan"
  | "explanation";

export interface IGeneratedContent extends Document {
  userId: string;
  sessionId?: string;
  type: ContentType;
  title: string;
  input: string;
  content: string; // JSON string or Markdown
  metadata: Record<string, unknown>;
  provider: "gemini" | "mistral" | "erick";
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedContentSchema = new Schema<IGeneratedContent>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["summary", "quiz", "flashcards", "study_plan", "explanation"],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    input: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    provider: {
      type: String,
      enum: ["gemini", "mistral", "erick"],
      default: "erick",
    },
  },
  {
    timestamps: true,
  }
);

GeneratedContentSchema.index({ userId: 1, createdAt: -1 });
GeneratedContentSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const GeneratedContent: Model<IGeneratedContent> =
  mongoose.models.GeneratedContent ||
  mongoose.model<IGeneratedContent>("GeneratedContent", GeneratedContentSchema);

export default GeneratedContent;
