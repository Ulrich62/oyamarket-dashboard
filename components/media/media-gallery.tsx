"use client";

import { useState, useTransition } from "react";
import { Media } from "@prisma/client";
import {
  Search,
  UploadCloud,
  Check,
  Copy,
  Trash2,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Cloud,
  Loader2,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useMediaUploader } from "@/lib/store/use-media-uploader";
import { deleteMedia } from "@/lib/actions/media";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/constants";
import { toast } from "sonner";

interface MediaGalleryProps {
  initialMedias: Media[];
}

export function MediaGallery({ initialMedias }: MediaGalleryProps) {
  const { openUploader } = useMediaUploader();
  const [medias, setMedias] = useState<Media[]>(initialMedias);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "image" | "video">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter medias based on search and tab
  const filteredMedias = medias.filter((m) => {
    const matchesTab =
      activeTab === "ALL" || m.resourceType === activeTab;
    const matchesQuery =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.format && m.format.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesQuery;
  });

  const totalBytes = medias.reduce((acc, m) => acc + (m.bytes || 0), 0);
  const formatTotalStorage = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopy = (url: string, id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
    } catch {}
    setCopiedId(id);
    toast.success("Lien public copié dans le presse-papier");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = () => {
    if (!mediaToDelete) return;
    const target = mediaToDelete;
    setDeletingId(target.id);
    startTransition(async () => {
      try {
        await deleteMedia(target.id);
        setMedias((prev) => prev.filter((m) => m.id !== target.id));
        toast.success(`« ${target.name} » a été supprimé définitivement.`);
        setMediaToDelete(null);
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la suppression.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight flex items-center gap-2.5">
            <span>Médiathèque</span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-bg-elev text-ink-3 border border-line">
              Cloudinary
            </span>
          </h1>
          <p className="text-sm text-ink-3 mt-1 flex items-center gap-2">
            <span>{medias.length} média{medias.length > 1 ? "s" : ""} enregistré{medias.length > 1 ? "s" : ""}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-ink-4" />
              {formatTotalStorage(totalBytes)} stockés dans <strong className="text-ink font-mono font-normal">oyamarket</strong>
            </span>
          </p>
        </div>

        <Button
          onClick={() => openUploader()}
          icon={<UploadCloud className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Uploader un média
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        
        {/* Type Tabs - Pill style identical to orders list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
              activeTab === "ALL"
                ? "bg-bg-elev-2 border-ink-3 text-ink"
                : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
            )}
          >
            Tous les formats
            <span className="bg-bg-elev-2 text-ink-3 rounded-md px-1.5 py-0.5 text-[10px]">
              {medias.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("image")}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
              activeTab === "image"
                ? "bg-bg-elev-2 border-ink-3 text-ink"
                : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            Images
            <span className="bg-bg-elev-2 text-ink-3 rounded-md px-1.5 py-0.5 text-[10px]">
              {medias.filter((m) => m.resourceType === "image").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
              activeTab === "video"
                ? "bg-bg-elev-2 border-ink-3 text-ink"
                : "bg-bg-elev border-line text-ink-3 hover:text-ink hover:bg-bg-elev-2"
            )}
          >
            <Film className="w-3.5 h-3.5 text-blue-400" />
            Vidéos
            <span className="bg-bg-elev-2 text-ink-3 rounded-md px-1.5 py-0.5 text-[10px]">
              {medias.filter((m) => m.resourceType === "video").length}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-ink-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full pl-9 pr-3 py-1.5 bg-bg-elev border border-line rounded-lg text-[13px] text-ink placeholder:text-ink-4 focus:outline-none focus:border-ink-4 focus:bg-bg-elev-2 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Medias */}
      {filteredMedias.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-4 rounded-2xl border border-dashed border-line bg-bg-elev/30 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-elev border border-line flex items-center justify-center text-ink-3">
            <Cloud className="w-7 h-7 text-ink-3" />
          </div>
          <div>
            <p className="font-medium text-ink">Aucun média trouvé</p>
            <p className="text-sm text-ink-3 mt-1">
              {searchQuery
                ? "Aucun fichier ne correspond à votre recherche."
                : "Votre médiathèque Cloudinary est vide pour l'instant."}
            </p>
          </div>
          <Button
            onClick={() => openUploader()}
            size="sm"
            icon={<UploadCloud className="w-3.5 h-3.5" />}
          >
            Uploader votre premier fichier
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedias.map((media) => {
            const isVideo = media.resourceType === "video";
            const isDeleting = deletingId === media.id;

            return (
              <div
                key={media.id}
                className={cn(
                  "group relative flex flex-col rounded-2xl border border-line bg-bg-elev overflow-hidden transition-all duration-200 hover:border-ink-3 hover:shadow-lg",
                  isDeleting && "opacity-40 pointer-events-none"
                )}
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square w-full bg-black/40 overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/50 group-hover:bg-black/30 transition-colors">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-lg">
                          <Film className="w-4 h-4 text-indigo-400" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={media.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}

                  {/* Format Badge Overlay */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono uppercase text-white font-medium tracking-wider shadow-sm">
                    {media.format || media.resourceType}
                  </span>

                  {/* Quick Action Overlay on hover (desktop) */}
                  <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => handleCopy(media.url, media.id)}
                      title="Copier le lien public"
                      aria-label="Copier le lien public"
                      className={cn(
                        "p-2 rounded-xl transition-all shadow-md backdrop-blur-sm border",
                        copiedId === media.id
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-bg-elev-2/95 hover:bg-bg-elev-2 text-ink border-line hover:border-ink-3"
                      )}
                    >
                      {copiedId === media.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ouvrir dans un nouvel onglet"
                      aria-label="Ouvrir dans un nouvel onglet"
                      className="p-2 rounded-xl bg-bg-elev-2/95 hover:bg-bg-elev-2 text-ink border border-line hover:border-ink-3 backdrop-blur-sm transition-all shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => setMediaToDelete(media)}
                      title="Supprimer ce média"
                      aria-label="Supprimer ce média"
                      className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 backdrop-blur-sm transition-all shadow-md cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-2.5 sm:p-3 flex flex-col gap-1.5 border-t border-line/60 bg-bg-elev/80">
                  <p className="text-xs font-medium text-ink truncate" title={media.name}>
                    {media.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-ink-3 font-mono">
                    <span>{formatFileSize(media.bytes)}</span>
                    <span className="font-sans text-ink-4">{formatDate(media.createdAt)}</span>
                  </div>

                  {/* Mobile Touch Action Buttons Bar */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-line-soft md:hidden">
                    <button
                      onClick={() => handleCopy(media.url, media.id)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border transition-colors",
                        copiedId === media.id
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-bg-elev text-ink-3 hover:text-ink border-line"
                      )}
                    >
                      {copiedId === media.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === media.id ? "Copié !" : "Lien"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md text-ink-3 hover:text-ink bg-bg-elev border border-line"
                        title="Ouvrir le média"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setMediaToDelete(media)}
                        className="p-1 rounded-md text-red-400 bg-red-500/10 border border-red-500/20"
                        title="Supprimer ce média"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Media Deletion */}
      <ConfirmModal
        isOpen={Boolean(mediaToDelete)}
        onClose={() => setMediaToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer définitivement ce média ?"
        description={`Êtes-vous sûr de vouloir supprimer « ${mediaToDelete?.name} » ? Le fichier sera définitivement supprimé du bucket Cloudinary et de votre base de données.`}
        confirmText="Supprimer définitivement"
        cancelText="Conserver"
        variant="danger"
        isLoading={isPending}
      />

    </div>
  );
}
