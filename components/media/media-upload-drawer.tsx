"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useMediaUploader } from "@/lib/store/use-media-uploader";
import { getVideoPosterUrl } from "@/lib/cloudinary-utils";
import {
  X,
  UploadCloud,
  Check,
  Copy,
  Loader2,
  ExternalLink,
  Cloud,
  Sparkles,
  AlertCircle,
  Film,
  Image as ImageIcon,
  Images,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  Plus,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  publicId?: string | null;
  format?: string | null;
  resourceType: string;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt?: string | Date;
}

export function MediaUploadDrawer() {
  const {
    isOpen,
    activeTab,
    allowMultiple,
    customTitle,
    closeUploader,
    setActiveTab,
    onUploadedCallback,
    onSelectMultipleCallback,
    setLastUploadedUrl,
  } = useMediaUploader();

  // Media Library state
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [isLoadingMedias, setIsLoadingMedias] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<"ALL" | "image" | "video">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Uploader state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<"url" | "poster" | "md" | "html" | "videoHtml" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch medias when drawer opens
  const fetchMedias = useCallback(async () => {
    setIsLoadingMedias(true);
    try {
      const res = await fetch("/api/v1/media");
      const data = await res.json();
      if (res.ok && data.medias) {
        setMedias(data.medias);
      }
    } catch (err) {
      console.error("Erreur chargement médiathèque:", err);
    } finally {
      setIsLoadingMedias(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMedias();
      setSelectedUrls([]);
      setUploadError(null);
      setUploadedMedia(null);
    }
  }, [isOpen, fetchMedias]);

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

  // Filtered medias for library
  const filteredMedias = useMemo(() => {
    return medias.filter((m) => {
      const matchesType = mediaFilter === "ALL" || m.resourceType === mediaFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.format && m.format.toLowerCase().includes(q)) ||
        m.url.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [medias, mediaFilter, searchQuery]);

  // Selection handlers
  const toggleSelectUrl = (url: string) => {
    if (allowMultiple) {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelectedUrls((prev) => (prev.includes(url) ? [] : [url]));
    }
  };

  const selectAllFiltered = () => {
    const allUrls = filteredMedias.map((m) => m.url);
    setSelectedUrls((prev) => Array.from(new Set([...prev, ...allUrls])));
  };

  const deselectAll = () => {
    setSelectedUrls([]);
  };

  // Insert selection into caller
  const handleInsertSelection = () => {
    if (selectedUrls.length === 0) return;

    if (onSelectMultipleCallback) {
      onSelectMultipleCallback(selectedUrls);
    } else if (onUploadedCallback) {
      selectedUrls.forEach((url) => {
        const item = medias.find((m) => m.url === url);
        const posterUrl = item?.resourceType === "video" ? getVideoPosterUrl(url) : null;
        onUploadedCallback(url, posterUrl);
      });
    }

    toast.success(
      selectedUrls.length > 1
        ? `${selectedUrls.length} médias insérés avec succès !`
        : "Média inséré avec succès !"
    );

    closeUploader();
  };

  // Direct double click or single click instant insert
  const handleQuickInsertSingle = (item: MediaItem) => {
    const posterUrl = item.resourceType === "video" ? getVideoPosterUrl(item.url) : null;
    if (onSelectMultipleCallback) {
      onSelectMultipleCallback([item.url]);
    } else if (onUploadedCallback) {
      onUploadedCallback(item.url, posterUrl);
    }
    toast.success(`« ${item.name} » inséré avec succès !`);
    closeUploader();
  };

  // Upload handler
  const uploadFile = async (file: File) => {
    setUploadError(null);
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
      const isVideo = data.media?.resourceType === "video" || file.type.startsWith("video/");
      const resolvedPosterUrl = data.posterUrl || (isVideo ? getVideoPosterUrl(data.url) : null);

      const completeMedia: MediaItem = {
        ...data.media,
        posterUrl: resolvedPosterUrl,
      };

      setUploadedMedia(completeMedia);
      setLastUploadedUrl(data.url, resolvedPosterUrl);

      // Add to local list and select
      setMedias((prev) => [completeMedia, ...prev]);
      setSelectedUrls([data.url]);

      toast.success("Média téléversé avec succès sur Cloudinary !");
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Une erreur est survenue lors de l'upload.");
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
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text: string, key: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {}
    setCopiedKey(key);
    toast.success(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatFileSize = (bytes?: number | null) => {
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
        onClick={closeUploader}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl bg-bg border-l border-line shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-bg-elev/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                {activeTab === "library" ? <Images className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  {customTitle || (activeTab === "library" ? "Médiathèque Cloudinary" : "Uploader un média")}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <Cloud className="w-3 h-3 text-indigo-400" />
                  <span>Bucket Cloudinary : <strong className="text-ink font-mono font-normal">oyamarket</strong></span>
                  <span>•</span>
                  <span>{medias.length} média{medias.length > 1 ? "s" : ""} disponible{medias.length > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
            <button
              onClick={closeUploader}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-elev transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-line/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  activeTab === "library"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-bg-elev border border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
                )}
              >
                <Images className="w-3.5 h-3.5" />
                <span>Médiathèque</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  activeTab === "library" ? "bg-white/20 text-white" : "bg-bg-elev-2 text-ink-3"
                )}>
                  {medias.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  activeTab === "upload"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-bg-elev border border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
                )}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Uploader un fichier</span>
              </button>
            </div>

            {activeTab === "library" && (
              <button
                type="button"
                onClick={fetchMedias}
                disabled={isLoadingMedias}
                title="Actualiser la liste"
                className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-elev border border-line transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoadingMedias && "animate-spin")} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ============================================================== */}
          {/* TAB 1: MÉDIATHÈQUE COMPLÈTE & SÉLECTION DIRECTE              */}
          {/* ============================================================== */}
          {activeTab === "library" && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-ink-4 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom, format, mot-clé..."
                    className="w-full pl-8 pr-8 py-1.5 bg-bg-elev border border-line rounded-lg text-xs text-ink placeholder:text-ink-4 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Type Filter Pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {(["ALL", "image", "video"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMediaFilter(t)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                        mediaFilter === t
                          ? "bg-bg-elev-2 border-indigo-500/50 text-indigo-400 font-semibold"
                          : "bg-bg-elev border-line text-ink-3 hover:text-ink"
                      )}
                    >
                      {t === "ALL" ? "Tous" : t === "image" ? "Images" : "Vidéos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Select Toolbar if multiple allowed */}
              {allowMultiple && filteredMedias.length > 0 && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-elev/60 border border-line text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-ink font-medium">
                      {selectedUrls.length} sélectionné{selectedUrls.length > 1 ? "s" : ""}
                    </span>
                    {selectedUrls.length > 0 && (
                      <span className="text-ink-4 font-mono text-[11px]">
                        sur {filteredMedias.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUrls.length < filteredMedias.length ? (
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        Tout sélectionner
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-[11px] text-ink-3 hover:text-ink font-medium cursor-pointer"
                      >
                        Désélectionner tout
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoadingMedias && medias.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs text-ink-3 font-medium">
                    Chargement de vos médias Cloudinary...
                  </p>
                </div>
              ) : filteredMedias.length === 0 ? (
                /* Empty state */
                <div className="py-16 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-line rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-xl bg-bg-elev border border-line flex items-center justify-center text-ink-4">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-ink">
                      Aucun média trouvé
                    </p>
                    <p className="text-[11px] text-ink-3 mt-0.5">
                      {searchQuery
                        ? `Aucun résultat pour « ${searchQuery} »`
                        : "Votre médiathèque est vide pour le moment."}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveTab("upload")}
                    icon={<UploadCloud className="w-3.5 h-3.5" />}
                  >
                    Uploader un premier fichier
                  </Button>
                </div>
              ) : (
                /* Medias Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredMedias.map((item) => {
                    const isSelected = selectedUrls.includes(item.url);
                    const isVideo = item.resourceType === "video";
                    const poster = isVideo ? getVideoPosterUrl(item.url) : null;

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectUrl(item.url)}
                        onDoubleClick={() => handleQuickInsertSingle(item)}
                        className={cn(
                          "group relative rounded-xl border overflow-hidden flex flex-col cursor-pointer transition-all duration-150 select-none bg-bg-elev",
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/40 shadow-md bg-indigo-500/5"
                            : "border-line hover:border-ink-3 hover:shadow-xs"
                        )}
                      >
                        {/* Media Visual Aspect */}
                        <div className="relative aspect-square w-full bg-black/20 overflow-hidden">
                          {isVideo ? (
                            <div className="relative w-full h-full">
                              <img
                                src={poster || item.url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                                <div className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-white">
                                  <Film className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                                VIDÉO
                              </span>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          )}

                          {/* Selection Checkbox Badge */}
                          <div className={cn(
                            "absolute top-1.5 left-1.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-indigo-600 text-white shadow-sm scale-100"
                              : "bg-black/50 backdrop-blur-xs text-white/70 opacity-0 group-hover:opacity-100"
                          )}>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded border border-white/80" />
                            )}
                          </div>

                          {/* Quick Copy URL Icon on Hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.url, item.id, "Lien copié !");
                            }}
                            title="Copier le lien public"
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedKey === item.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Name and format footer */}
                        <div className="p-2 bg-bg-elev/90 border-t border-line/60 flex flex-col gap-0.5">
                          <p className="text-[11px] font-medium text-ink truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-ink-4 font-mono uppercase">
                            <span>{item.format || (isVideo ? "mp4" : "jpg")}</span>
                            <span>{formatFileSize(item.bytes)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: UPLOADER UN NOUVEAU FICHIER VERS CLOUDINARY           */}
          {/* ============================================================== */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              
              {/* Error Banner */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-0.5">Erreur d'upload</p>
                    <p className="text-red-300/90">{uploadError}</p>
                  </div>
                </div>
              )}

              {/* Upload Success State */}
              {uploadedMedia ? (
                (() => {
                  const isVideo = uploadedMedia.resourceType === "video";
                  const posterUrl = uploadedMedia.publicId ? getVideoPosterUrl(uploadedMedia.url) : null;

                  return (
                    <div className="space-y-4">
                      {/* Success Badge */}
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-medium">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Média envoyé sur Cloudinary avec succès !</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickInsertSingle(uploadedMedia)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs font-semibold"
                        >
                          Insérer immédiatement
                        </Button>
                      </div>

                      {/* Media Preview */}
                      <div className="relative rounded-xl border border-line bg-bg-elev overflow-hidden">
                        {isVideo ? (
                          <div className="relative">
                            <video
                              src={uploadedMedia.url}
                              poster={posterUrl || undefined}
                              controls
                              playsInline
                              className="w-full max-h-56 object-cover bg-black"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full aspect-video bg-black/30 flex items-center justify-center overflow-hidden">
                            <img
                              src={uploadedMedia.url}
                              alt={uploadedMedia.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        <div className="p-3 border-t border-line/60 bg-bg-elev/80 flex items-center justify-between text-xs text-ink-3">
                          <span className="truncate max-w-[200px] text-ink font-medium">
                            {uploadedMedia.name}
                          </span>
                          <span className="font-mono text-[11px] uppercase bg-bg-elev-2 px-1.5 py-0.5 rounded border border-line">
                            {uploadedMedia.format || (isVideo ? "mp4" : "media")} · {formatFileSize(uploadedMedia.bytes)}
                          </span>
                        </div>
                      </div>

                      {/* Public URL Box */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-ink-3 flex items-center gap-1.5">
                          <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Lien public Cloudinary CDN</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={uploadedMedia.url}
                            className="flex-1 bg-bg-elev border border-line rounded-lg px-3 py-2 text-xs font-mono text-ink select-all focus:outline-none"
                          />
                          <Button
                            size="sm"
                            variant={copiedType === "url" ? "secondary" : "primary"}
                            onClick={() => copyToClipboard(uploadedMedia.url, "url", "Lien copié !")}
                            icon={copiedType === "url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          >
                            {copiedType === "url" ? "Copié !" : "Copier"}
                          </Button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          variant="primary"
                          onClick={() => handleQuickInsertSingle(uploadedMedia)}
                          className="flex-1"
                        >
                          Insérer ce média dans le formulaire
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setUploadedMedia(null);
                            setActiveTab("library");
                          }}
                        >
                          Voir la médiathèque
                        </Button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Drop Area */
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
                          Bucket : oyamarket
                        </p>
                      </div>
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
              )}

              {/* Explanatory notes */}
              <div className="p-3 rounded-xl bg-bg-elev border border-line text-[11px] text-ink-3 space-y-1.5">
                <p className="font-semibold text-ink flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                  Stockage Cloudinary Dédié
                </p>
                <p>
                  Les fichiers sont stockés dans le bucket <code className="text-ink font-mono">oyamarket</code> et diffusés via le CDN Cloudinary haute performance.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Sticky Action Footer */}
        {activeTab === "library" && (
          <div className="px-5 py-3.5 border-t border-line bg-bg-elev/90 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-3">
                {selectedUrls.length === 0 ? (
                  allowMultiple ? "Sélectionnez une ou plusieurs images" : "Sélectionnez une image"
                ) : (
                  <strong className="text-indigo-400 font-semibold">
                    {selectedUrls.length} image{selectedUrls.length > 1 ? "s" : ""} sélectionnée{selectedUrls.length > 1 ? "s" : ""}
                  </strong>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={closeUploader}
              >
                Annuler
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={selectedUrls.length === 0}
                onClick={handleInsertSelection}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              >
                {selectedUrls.length > 1
                  ? `Insérer (${selectedUrls.length})`
                  : selectedUrls.length === 1
                  ? "Insérer l'image"
                  : "Insérer"}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
