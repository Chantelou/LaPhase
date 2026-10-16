import { AttachmentFile } from "../types";

export function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const token = localStorage.getItem("erick_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const userStr = localStorage.getItem("erick_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        headers["x-user-id"] = user.id;
      }
    }
  } catch {}

  return headers;
}

export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("erick_user");
    if (userStr) return JSON.parse(userStr);
  } catch {}
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function readFileAsBase64(file: File): Promise<AttachmentFile> {
  return new Promise((resolve, reject) => {
    // 25MB safety limit
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error("Le fichier est trop volumineux (maximum 25 Mo)."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve({
        name: file.name,
        mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        size: file.size,
        base64: base64String,
      });
    };
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier."));
    };
    reader.readAsDataURL(file);
  });
}
