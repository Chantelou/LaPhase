import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  userId: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  provider?: "gemini" | "mistral";
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ["gemini", "mistral"],
      default: "gemini",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for conversation history
MessageSchema.index({ sessionId: 1, createdAt: 1 });
MessageSchema.index({ userId: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
