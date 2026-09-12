"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "#141414",
          border: "1px solid rgba(250, 248, 243, 0.12)",
          color: "#faf8f3",
        },
      }}
    />
  );
}
