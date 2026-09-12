"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-150"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-[#121214] p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              variant === "danger"
                ? "bg-red-500/15 border border-red-500/25 text-red-400"
                : "bg-indigo-500/15 border border-indigo-500/25 text-indigo-400"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-ink leading-snug">{title}</h3>
            <p className="text-xs text-ink-3 mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line/60 mt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            loading={isLoading}
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-medium border-transparent shadow-sm"
                : ""
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
