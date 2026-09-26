"use client";

import React, { useState } from "react";
import { GripVertical, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableImageGridProps {
  images: string[];
  onReorder: (newImages: string[]) => void;
  onRemove: (index: number) => void;
  emptyMessage?: string;
  className?: string;
}

export function SortableImageGrid({
  images = [],
  onReorder,
  onRemove,
  emptyMessage = "Aucune image dans cette liste pour le moment.",
  className,
}: SortableImageGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== targetIndex) {
      const updated = [...images];
      const [movedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      onReorder(updated);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (fromIndex: number, toIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    onReorder(updated);
  };

  if (!images || images.length === 0) {
    return (
      <div className="py-8 px-4 rounded-xl border border-dashed border-line bg-bg-elev/20 flex flex-col items-center justify-center text-center">
        <ImageIcon className="w-8 h-8 text-ink-4 mb-2" />
        <p className="text-xs text-ink-3">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {images.length > 1 && (
        <div className="flex items-center justify-between text-[11px] text-ink-3 px-0.5">
          <span className="flex items-center gap-1.5 font-medium text-ink-2">
            <GripVertical className="w-3.5 h-3.5 text-primary" />
            <span>
              {images.length} {images.length > 1 ? "images" : "image"} • Glissez-déposez une image pour changer son ordre
            </span>
          </span>
          <span className="text-[10px] text-ink-4 hidden sm:inline">
            Astuce : vous pouvez aussi utiliser les flèches ◀ ▶ au survol
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((url, idx) => {
          const isDragging = draggedIndex === idx;
          const isOver = dragOverIndex === idx && draggedIndex !== idx;

          return (
            <div
              key={`${url}-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnter={(e) => handleDragOver(e, idx)}
              onDragLeave={(e) => handleDragLeave(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border bg-bg group select-none transition-all duration-200 cursor-grab active:cursor-grabbing",
                isDragging && "opacity-30 scale-95 border-dashed border-primary ring-2 ring-primary/40",
                isOver && "scale-[1.04] border-primary ring-2 ring-primary ring-offset-2 ring-offset-bg shadow-xl z-20 bg-primary/10",
                !isDragging && !isOver && "border-line hover:border-ink-4 hover:shadow-md"
              )}
            >
              {/* Image Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />

              {/* Position badge with drag grip */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold shadow-xs pointer-events-none">
                <GripVertical className="w-3 h-3 text-white/70" />
                <span>#{idx + 1}</span>
              </div>

              {/* Remove button (top right) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                title="Supprimer cette image"
                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Bottom Quick-Reorder Controls on Hover */}
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={(e) => moveItem(idx, idx - 1, e)}
                    title="Déplacer vers la gauche"
                    className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] text-white/80 font-medium">
                    Glisser
                  </span>

                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={(e) => moveItem(idx, idx + 1, e)}
                    title="Déplacer vers la droite"
                    className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
