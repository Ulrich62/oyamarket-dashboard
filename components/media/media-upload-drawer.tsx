"use client";

import { useState, useRef, useEffect } from "react";
import { useMediaUploader } from "@/lib/store/use-media-uploader";
import {
  X,
  UploadCloud,
  Check,
  Copy,
  Loader2,
  ExternalLink,
  ArrowRight,
  Cloud,
  Sparkles,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadedMedia {
  id: string;
  name: string;
  url: string;
  format?: string;
  resourceType?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export function MediaUploadDrawer() {
  const { isOpen, closeUploader, onUploadedCallback, setLastUploadedUrl } = useMediaUploader();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<"url" | "md" | "html" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeUploader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeUploader]);

  const handleClose = () => {
    closeUploader();
  };

  const handleReset = () => {
    setUploadedMedia(null);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "oyamarket/media");

    try {
      setUploadProgress(60);
      const res = await fetch("/api/v1/media/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Échec de l'upload vers Cloudinary");
      }

      setUploadProgress(100);
      setUploadedMedia(data.media);
      setLastUploadedUrl(data.url);

      if (onUploadedCallback) {
        onUploadedCallback(data.url);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Une erreur est survenue lors de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadFile(file);
    }
  };

  const copyToClipboard = (text: string, type: "url" | "md" | "html") => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {}
    setCopiedType(type);
    toast.success("Copié dans le presse-papier !");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-bg border-l border-line shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-bg-elev/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Uploader un média
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
                <Cloud className="w-3 h-3 text-indigo-400" />
                <span>Bucket Cloudinary : <strong className="text-ink font-mono font-normal">oyamarket</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-elev transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-0.5">Erreur d'upload</p>
                <p className="text-red-300/90">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Success State */}
          {uploadedMedia ? (
            <div className="space-y-4">
              
              {/* Success Badge */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Média envoyé sur Cloudinary avec succès !</span>
              </div>

              {/* Media Preview */}
              <div className="relative rounded-xl border border-line bg-bg-elev overflow-hidden">
                {uploadedMedia.resourceType === "video" ? (
                  <video
                    src={uploadedMedia.url}
                    controls
                    className="w-full max-h-56 object-cover bg-black"
                  />
                ) : (
                  <div className="relative w-full aspect-video bg-black/30 flex items-center justify-center overflow-hidden">
                    <img
                      src={uploadedMedia.url}
                      alt={uploadedMedia.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                {/* File info footer */}
                <div className="p-3 border-t border-line/60 bg-bg-elev/80 flex items-center justify-between text-xs text-ink-3">
                  <span className="truncate max-w-[200px] text-ink font-medium">
                    {uploadedMedia.name}
                  </span>
                  <span className="font-mono text-[11px] uppercase bg-bg-elev-2 px-1.5 py-0.5 rounded border border-line">
                    {uploadedMedia.format || "media"} · {formatFileSize(uploadedMedia.bytes)}
                  </span>
                </div>
              </div>

              {/* Public URL Box with 1-Click Copy */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-ink-3">
                  Lien public direct (Cloudinary CDN)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={uploadedMedia.url}
                    className="flex-1 bg-bg-elev border border-line rounded-lg px-3 py-2 text-xs font-mono text-ink select-all focus:outline-none focus:border-ink-4 focus:bg-bg-elev-2"
                  />
                  <Button
                    size="sm"
                    variant={copiedType === "url" ? "secondary" : "primary"}
                    onClick={() => copyToClipboard(uploadedMedia.url, "url")}
                    icon={
                      copiedType === "url" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className={cn(
                      "shrink-0",
                      copiedType === "url" && "border-emerald-500/30 text-emerald-400"
                    )}
                  >
                    {copiedType === "url" ? "Copié !" : "Copier"}
                  </Button>
                </div>
              </div>

              {/* Quick Formats to copy */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `![${uploadedMedia.name}](${uploadedMedia.url})`,
                      "md"
                    )
                  }
                  className="p-2 rounded-lg border border-line bg-bg-elev hover:bg-bg-elev-2 text-xs text-ink-2 hover:text-ink flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedType === "md" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Balise Markdown</span>
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `<img src="${uploadedMedia.url}" alt="${uploadedMedia.name}" />`,
                      "html"
                    )
                  }
                  className="p-2 rounded-lg border border-line bg-bg-elev hover:bg-bg-elev-2 text-xs text-ink-2 hover:text-ink flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedType === "html" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Balise HTML</span>
                </button>
              </div>

              {/* Reset / Other actions */}
              <div className="pt-3 border-t border-line space-y-2">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  icon={<UploadCloud className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Uploader un autre média
                </Button>

                <Link
                  href="/media"
                  onClick={handleClose}
                  className="w-full py-2 rounded-lg text-xs font-medium text-ink-3 hover:text-ink hover:bg-bg-elev flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Gérer tous les médias</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ) : (
            /* Upload Dropzone */
            <div className="space-y-4">
              
              {/* Drop Area */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                    : "border-line hover:border-ink-3 bg-bg-elev/40 hover:bg-bg-elev/70",
                  isUploading && "pointer-events-none opacity-80"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={onFileSelect}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      <Sparkles className="w-4 h-4 text-indigo-400 absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink">
                        Envoi vers Cloudinary...
                      </p>
                      <p className="text-[11px] text-ink-3 mt-0.5 font-mono">
                        Dossier : oyamarket/media
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-48 h-1.5 bg-bg-elev-2 rounded-full overflow-hidden mt-1 border border-line">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-bg-elev border border-line flex items-center justify-center text-indigo-400 mb-3 shadow-inner group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-semibold text-ink">
                      Glissez-déposez un fichier ici
                    </p>
                    <p className="text-[11px] text-ink-3 mt-1 max-w-[220px]">
                      ou cliquez pour parcourir vos dossiers
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] text-ink-4 uppercase font-mono">
                      <span>PNG, JPG, WEBP</span>
                      <span>•</span>
                      <span>MP4, WEBM</span>
                      <span>•</span>
                      <span>Max 50 Mo</span>
                    </div>
                  </>
                )}
              </div>

              {/* Explanatory notes */}
              <div className="p-3 rounded-xl bg-bg-elev border border-line text-[11px] text-ink-3 space-y-1.5">
                <p className="font-semibold text-ink flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                  Stockage Cloudinary Dédié
                </p>
                <p>
                  Les fichiers sont stockés dans le bucket <code className="text-ink font-mono">oyamarket</code> et diffusés via le CDN Cloudinary. Le lien public direct peut être copié et inséré dans vos produits et bannières.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/media"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                >
                  <span>Accéder à la médiathèque complète</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
