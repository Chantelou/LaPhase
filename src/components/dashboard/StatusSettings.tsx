import React, { useEffect, useState } from "react";
import {
  Server,
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface HealthData {
  status: string;
  timestamp: string;
  service: string;
  environment: string;
  database: {
    connected: boolean;
    configured: boolean;
  };
  aiEngine?: {
    active: boolean;
    name: string;
  };
}

export const StatusSettings: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Statut Système & Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Vérification de l'état de l'application, des providers IA et de MongoDB
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          isLoading={loading}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend & Environment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <Badge variant="success">Opérationnel</Badge>
            </div>
            <CardTitle className="text-sm mt-3">Serveur Backend</CardTitle>
            <CardDescription className="text-xs">
              Next.js / Express Full-Stack unifié
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-1.5 pt-0">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Port :</span>
              <span className="font-mono font-medium text-slate-800">3000</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Node :</span>
              <span className="font-mono font-medium text-slate-800">v22 LTS</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Mode :</span>
              <span className="font-mono font-medium text-slate-800">
                {health?.environment || "development"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <Badge variant={health?.database.connected ? "success" : "neutral"}>
                {health?.database.connected ? "Connecté" : "Auto-hébergé VPS"}
              </Badge>
            </div>
            <CardTitle className="text-sm mt-3">MongoDB Community</CardTitle>
            <CardDescription className="text-xs">
              Mongoose & Volume Docker persistant
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-1.5 pt-0">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Hébergement :</span>
              <span className="font-medium text-slate-800">VPS Auto-hébergé</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Sécurité :</span>
              <span className="font-medium text-slate-800">Réseau Docker privé</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Atlas :</span>
              <span className="text-rose-600 font-medium">Banni (Conforme)</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Providers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <Badge variant="indigo">Moteur Actif</Badge>
            </div>
            <CardTitle className="text-sm mt-3">Moteur Erick AI</CardTitle>
            <CardDescription className="text-xs">
              Intelligence pédagogique & Multimédia
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-1.5 pt-0">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Assistant :</span>
              <span className="font-semibold text-indigo-600">Erick AI</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Dictée Vocale :</span>
              <span className="font-medium text-emerald-600">Web Speech API</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Médias & Vidéos :</span>
              <span className="font-medium text-violet-600">YouTube & Schémas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment & Docker summary card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-base">Spécification Déploiement VPS & Docker</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Configuration conteneurisée prête pour la mise en production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="font-semibold text-slate-900 mb-1">📦 Dockerfile multi-stage</p>
              <p className="text-slate-500 text-[11px]">
                Build léger avec node:22-alpine, utilisateur non-root 'studyassistant',
                sécurisé et prêt pour le cloud.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="font-semibold text-slate-900 mb-1">🗄️ Docker Compose & MongoDB</p>
              <p className="text-slate-500 text-[11px]">
                MongoDB 7 Community Edition avec volume persistant <code className="bg-white px-1 py-0.5 rounded border border-slate-200">mongodb_data</code> et réseau interne étanche.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusSettings;
