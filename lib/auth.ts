import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { isDatabaseConnected } from "./mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "erick-ai-secret-key-study-platform-2026";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

// In-memory fallback if MongoDB is not connected yet
const memoryUsers: Map<string, { id: string; name: string; email: string; passwordHash: string; createdAt: Date }> = new Map([
  [
    "etudiant@erick.ai",
    {
      id: "demo_student_1",
      name: "Alexandre Dupont",
      email: "etudiant@erick.ai",
      // default demo password: "password123"
      passwordHash: bcrypt.hashSync("password123", 10),
      createdAt: new Date(),
    },
  ],
]);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: SafeUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SafeUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedName = name.trim();

  if (isDatabaseConnected()) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error("Un compte existe déjà avec cette adresse email.");
    }
    const passwordHash = await hashPassword(password);
    const created = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });

    const safeUser: SafeUser = {
      id: created._id.toString(),
      name: created.name,
      email: created.email,
      createdAt: created.createdAt?.toISOString(),
    };

    return { user: safeUser, token: generateToken(safeUser) };
  }

  // Fallback to memory store
  if (memoryUsers.has(normalizedEmail)) {
    throw new Error("Un compte existe déjà avec cette adresse email.");
  }

  const passwordHash = await hashPassword(password);
  const id = "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const newUser = {
    id,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  };

  memoryUsers.set(normalizedEmail, newUser);

  const safeUser: SafeUser = {
    id,
    name: trimmedName,
    email: normalizedEmail,
    createdAt: newUser.createdAt.toISOString(),
  };

  return { user: safeUser, token: generateToken(safeUser) };
}

export async function authenticateUser(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isDatabaseConnected()) {
    const userDoc = await User.findOne({ email: normalizedEmail });
    if (!userDoc) {
      throw new Error("Identifiants incorrects. Aucun compte trouvé.");
    }

    const isValid = await comparePassword(password, userDoc.passwordHash);
    if (!isValid) {
      throw new Error("Mot de passe incorrect.");
    }

    const safeUser: SafeUser = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      createdAt: userDoc.createdAt?.toISOString(),
    };

    return { user: safeUser, token: generateToken(safeUser) };
  }

  // Memory store check
  const memUser = memoryUsers.get(normalizedEmail);
  if (!memUser) {
    throw new Error("Identifiants incorrects. Aucun compte trouvé.");
  }

  const isValid = await comparePassword(password, memUser.passwordHash);
  if (!isValid) {
    throw new Error("Mot de passe incorrect.");
  }

  const safeUser: SafeUser = {
    id: memUser.id,
    name: memUser.name,
    email: memUser.email,
    createdAt: memUser.createdAt.toISOString(),
  };

  return { user: safeUser, token: generateToken(safeUser) };
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  if (isDatabaseConnected()) {
    try {
      const userDoc = await User.findById(id);
      if (userDoc) {
        return {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          createdAt: userDoc.createdAt?.toISOString(),
        };
      }
    } catch {
      return null;
    }
  }

  for (const u of memoryUsers.values()) {
    if (u.id === id) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      };
    }
  }

  return null;
}
