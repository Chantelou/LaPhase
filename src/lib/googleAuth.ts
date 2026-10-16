import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { DriveFileItem, TeacherEmail, AttachmentFile } from "../types";

// Initialize Firebase App instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configured Workspace Scopes
export const WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Cache the access token in memory only (never localStorage)
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;
let isSigningIn = false;

// Listen for auth state changes
export const initGoogleAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    cachedGoogleUser = user;
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onFailure) onFailure();
      }
    }
  });
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getGoogleUser = (): User | null => {
  return cachedGoogleUser;
};

export const isGoogleConnected = (): boolean => {
  return !!(cachedGoogleUser && cachedAccessToken);
};

// Sign in with Google Popup
export const connectGoogleAccount = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Impossible d'obtenir le jeton d'accès Google.");
    }
    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Erreur de connexion Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out from Google
export const disconnectGoogleAccount = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedGoogleUser = null;
};

// ==========================================
// GOOGLE DRIVE API UTILITIES
// ==========================================

export async function fetchDriveFiles(
  token: string,
  searchQuery?: string
): Promise<DriveFileItem[]> {
  try {
    let q = "trashed = false";
    if (searchQuery && searchQuery.trim()) {
      const sanitized = searchQuery.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }

    const fields = "files(id,name,mimeType,size,modifiedTime,iconLink,thumbnailLink)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=${encodeURIComponent(fields)}&pageSize=35&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.error?.message || `Erreur Google Drive HTTP ${res.status}`
      );
    }

    const data = await res.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size, 10) : undefined,
      modifiedTime: file.modifiedTime,
      iconLink: file.iconLink,
      thumbnailLink: file.thumbnailLink,
    }));
  } catch (err: any) {
    console.error("fetchDriveFiles error:", err);
    throw err;
  }
}

// Download a Drive file and convert it into an AttachmentFile base64 for Erick
export async function downloadDriveFileAsAttachment(
  token: string,
  file: DriveFileItem
): Promise<AttachmentFile> {
  let downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
  let targetMimeType = file.mimeType;

  // Handle Google Docs / Sheets / Slides by exporting as PDF
  if (file.mimeType === "application/vnd.google-apps.document") {
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
    targetMimeType = "application/pdf";
  } else if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
    targetMimeType = "application/pdf";
  } else if (file.mimeType === "application/vnd.google-apps.presentation") {
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`;
    targetMimeType = "application/pdf";
  }

  const res = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Impossible de télécharger le fichier Drive (${res.status})`);
  }

  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({
        name: file.name.endsWith(".pdf") ? file.name : `${file.name}.pdf`,
        mimeType: targetMimeType.startsWith("application/vnd.google-apps")
          ? "application/pdf"
          : targetMimeType,
        size: blob.size,
        base64,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ==========================================
// GMAIL API UTILITIES
// ==========================================

export async function fetchGmailMessages(
  token: string,
  query = ""
): Promise<TeacherEmail[]> {
  try {
    // List messages
    const qParam = query ? `&q=${encodeURIComponent(query)}` : "";
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15${qParam}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      throw new Error(`Erreur récupération messages Gmail (${listRes.status})`);
    }

    const listData = await listRes.json();
    const messageIds: Array<{ id: string; threadId: string }> =
      listData.messages || [];

    if (messageIds.length === 0) {
      return [];
    }

    // Fetch message details in parallel
    const emailPromises = messageIds.slice(0, 12).map(async (msgItem) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgItem.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();

      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find(
          (h: any) => h.name.toLowerCase() === name.toLowerCase()
        )?.value || "";

      const subject = getHeader("Subject") || "Sans objet";
      const from = getHeader("From") || "Expéditeur inconnu";
      const to = getHeader("To") || "";
      const date = getHeader("Date") || "";

      // Extract sender name
      const nameMatch = from.match(/^([^<]+)/);
      const senderName = nameMatch ? nameMatch[1].replace(/"/g, "").trim() : from;

      // Extract plain text body
      let bodyText = "";
      const parsePart = (part: any) => {
        if (part.mimeType === "text/plain" && part.body?.data) {
          try {
            const decoded = atob(
              part.body.data.replace(/-/g, "+").replace(/_/g, "/")
            );
            bodyText += decodeURIComponent(escape(decoded)) + "\n";
          } catch {
            // fallback atob
            bodyText += atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/")) + "\n";
          }
        } else if (part.parts && Array.isArray(part.parts)) {
          part.parts.forEach(parsePart);
        }
      };

      if (detail.payload) {
        parsePart(detail.payload);
      }
      if (!bodyText.trim()) {
        bodyText = detail.snippet || "";
      }

      // Check if teacher/academic keyword
      const isTeacher =
        /prof|docteur|enseignant|université|faculté|lycée|mme|mr|cours|devoir|tp|td|examen|partiel/i.test(
          `${from} ${subject} ${bodyText}`
        );

      return {
        id: detail.id,
        threadId: detail.threadId,
        from,
        senderName,
        to,
        subject,
        date,
        snippet: detail.snippet || "",
        body: bodyText.trim(),
        isTeacher,
      } as TeacherEmail;
    });

    const results = await Promise.all(emailPromises);
    return results.filter((m): m is TeacherEmail => m !== null);
  } catch (err: any) {
    console.error("fetchGmailMessages error:", err);
    throw err;
  }
}

// Send Email via Gmail API (RFC 2822)
export async function sendGmailReply(
  token: string,
  to: string,
  subject: string,
  content: string,
  threadId?: string,
  inReplyToMessageId?: string
): Promise<boolean> {
  try {
    const lines = [
      `To: ${to}`,
      `Subject: ${subject.startsWith("Re:") ? subject : `Re: ${subject}`}`,
      "Content-Type: text/plain; charset=UTF-8",
      "MIME-Version: 1.0",
    ];

    if (inReplyToMessageId) {
      lines.push(`In-Reply-To: ${inReplyToMessageId}`);
      lines.push(`References: ${inReplyToMessageId}`);
    }

    lines.push("");
    lines.push(content);

    const rawMessage = lines.join("\r\n");
    // Base64URL encode
    const base64Encoded = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: base64Encoded,
          threadId: threadId || undefined,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erreur d'envoi Gmail (${res.status})`);
    }

    return true;
  } catch (err: any) {
    console.error("sendGmailReply error:", err);
    throw err;
  }
}
