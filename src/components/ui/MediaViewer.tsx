import React, { useState } from "react";
import { Play, ExternalLink, Image as ImageIcon, Video, X, Maximize2, Sparkles } from "lucide-react";
import { EducationalVideo, EducationalImage } from "../../types";

interface MediaViewerProps {
  videos?: EducationalVideo[];
  images?: EducationalImage[];
  title?: string;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  videos = [],
  images = [],
  title = "Vidéos explicatives & Schémas recommandés",
}) => {
  const [activeVideo, setActiveVideo] = useState<EducationalVideo | null>(null);
  const [activeImage, setActiveImage] = useState<EducationalImage | null>(null);

  if (videos.length === 0 && images.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/80">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <h4 className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
          {title}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Videos list */}
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Video Thumbnail with Play Button */}
            <div
              className="relative h-32 w-full bg-slate-800 cursor-pointer overflow-hidden"
              onClick={() => setActiveVideo(vid)}
            >
              <img
                src={vid.thumbnailUrl}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-500 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {vid.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {vid.duration}
                </span>
              )}

              <span className="absolute top-2 left-2 bg-rose-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" /> YouTube
              </span>
            </div>

            {/* Video Info */}
            <div className="p-2.5 bg-white flex-1 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {vid.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{vid.channel}</p>
              </div>

              <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveVideo(vid)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" /> Lire la vidéo
                </button>
                <a
                  href={vid.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                  title="Ouvrir sur YouTube"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Images / Diagrams list */}
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            <div
              className="relative h-32 w-full bg-slate-100 cursor-pointer overflow-hidden"
              onClick={() => setActiveImage(img)}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
              <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Schéma
              </span>
            </div>

            <div className="p-2.5 bg-white flex-1 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                  {img.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  {img.caption}
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Agrandir le schéma
                </button>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {img.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded YouTube Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl overflow-hidden max-w-2xl w-full border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <Video className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold truncate max-w-md">{activeVideo.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-3 bg-slate-900 text-xs text-slate-300 flex items-center justify-between">
              <span>{activeVideo.description}</span>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1 ml-3 shrink-0"
              >
                YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Image Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{activeImage.title}</h4>
                <p className="text-xs text-slate-500">{activeImage.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto bg-slate-100 flex items-center justify-center p-2">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600">
              <p>{activeImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
