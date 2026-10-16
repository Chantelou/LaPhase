import mongoose, { Schema, Document, Model } from "mongoose";

export type SessionType =
  | "chat"
  | "summary"
  | "quiz"
  | "flashcards"
  | "study_plan"
  | "explanation";

export interface IStudySession extends Document {
  userId: string;
  title: string;
  type: SessionType;
  createdAt: Date;
  updatedAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>(
  {
    userId: {
      type: String,
      required: [true, "L'identifiant utilisateur est requis"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      required: true,
      enum: ["chat", "summary", "quiz", "flashcards", "study_plan", "explanation"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite indexes for fast student queries
StudySessionSchema.index({ userId: 1, createdAt: -1 });
StudySessionSchema.index({ userId: 1, type: 1 });

export const StudySession: Model<IStudySession> =
  mongoose.models.StudySession ||
  mongoose.model<IStudySession>("StudySession", StudySessionSchema);

export default StudySession;
