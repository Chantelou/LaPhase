import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  HardDrive,
  RefreshCw,
  Download,
  AlertCircle,
  ExternalLink,
  Check,
} from "lucide-react";
import {
  fetchDriveFiles,
  downloadDriveFileAsAttachment,
  connectGoogleAccount,
  getGoogleAccessToken,
  getGoogleUser,
  isGoogleConnected,
} from "../../lib/googleAuth";
import { DriveFileItem, AttachmentFile } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { formatFileSize } from "../../lib/api";

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAttachment: (attachment: AttachmentFile) => void;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAttachment,
}) => {
  const [token, setToken] = useState<string | null>(getGoogleAccessToken());
  const [googleUser, setGoogleUser] = useState(getGoogleUser());
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "images" | "docs">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentToken = getGoogleAccessToken();
      setToken(currentToken);
      setGoogleUser(getGoogleUser());
      if (currentToken) {
        loadFiles(currentToken);
      }
    }
  }, [isOpen]);

  const loadFiles = async (authToken: string, queryText = "") => {
    setLoading(true);
    setError(null);
    try {
      const driveFiles = await fetchDriveFiles(authToken, queryText);
      setFiles(driveFiles);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des fichiers Google Drive."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await connectGoogleAccount();
      setToken(res.accessToken);
      setGoogleUser(res.user);
      await loadFiles(res.accessToken);
    } catch (err: any) {
      setError(
        err.message || "La connexion avec votre compte Google a échoué."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async (file: DriveFileItem) => {
    if (!token) return;
    setDownloadingId(file.id);
    setError(null);

    try {
      const attachment = await downloadDriveFileAsAttachment(token, file);
      onSelectAttachment(attachment);
      onClose();
    } catch (err: any) {
      setError(
        err.message || "Impossible de télécharger le fichier depuis Google Drive."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = files.filter((f) => {
    if (filterType === "pdf") return f.mimeType.includes("pdf");
    if (filterType === "images") return f.mimeType.includes("image");
    if (filterType === "docs")
      return (
        f.mimeType.includes("document") ||
        f.mimeType.includes("spreadsheet") ||
        f.mimeType.includes("presentation")
      );
    return true;
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-rose-600" />;
    if (mimeType.includes("image")) return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (mimeType.includes("spreadsheet"))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-700" />;
    if (mimeType.includes("document") || mimeType.includes("word"))
      return <FileText className="w-5 h-5 text-blue-600" />;
    return <FileCode className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Importer depuis Google Drive
                <Badge variant="indigo" className="text-[10px]">
                  Erick Drive Sync
                </Badge>
              </h3>
              <p className="text-xs text-slate-500">
                Sélectionnez un document PDF, cours manuscrit ou photo de votre Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth status banner */}
        {!token ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <HardDrive className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900">
                Connexion à votre compte Google requise
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Autorisez Erick AI à accéder à vos fichiers de révision sur Google Drive pour les analyser pas-à-pas.
              </p>
            </div>

            {error && (
              <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleConnectGoogle}
              isLoading={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Se connecter avec Google
            </Button>
          </div>
        ) : (
          <>
            {/* Search & Filter bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Rechercher un fichier sur votre Drive..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && token) loadFiles(token, search);
                    }}
                    className="pl-9 text-xs bg-white"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => token && loadFiles(token, search)}
                  disabled={loading}
                  title="Actualiser les fichiers"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: "all", label: "Tous" },
                      { id: "pdf", label: "PDF" },
                      { id: "images", label: "Images" },
                      { id: "docs", label: "Docs / Slides" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterType(f.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                        filterType === f.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {googleUser && (
                  <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    Connecté : <strong className="text-slate-700">{googleUser.email}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                  <span>Chargement des fichiers Google Drive...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>Aucun fichier trouvé sur votre Drive pour cette recherche.</p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          {file.size ? formatFileSize(file.size) : "Google Docs"}
                          {file.modifiedTime && (
                            <span>
                              • Modifié le{" "}
                              {new Date(file.modifiedTime).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSelectFile(file)}
                      isLoading={downloadingId === file.id}
                      disabled={!!downloadingId}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Analyser
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Google Workspace Integration • Erick AI</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};
