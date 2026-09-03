"use client";

import { useState } from "react";
import { Copy, Check, Terminal, ExternalLink } from "lucide-react";

export function ApiIntegrationCard({ storeId }: { storeId: string }) {
  const [copied, setCopied] = useState<"id" | "endpoint" | null>(null);

  const endpoint = "https://oyamarket.com/api/v1/orders"; // Remplacez par votre vrai domaine

  const copyToClipboard = (text: string, type: "id" | "endpoint") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-5 mt-6">
      <div>
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent" />
          Intégration API & Création Externe
        </h2>
        <p className="text-[12px] text-ink-3 mt-1">
          Utilisez ces informations pour connecter OyaMarket à votre boutique Shopify, WooCommerce ou un formulaire personnalisé.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Store ID */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
            ID de la Boutique (storeId)
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-bg-elev border border-line p-1 pl-3">
            <code className="text-[12px] font-mono text-ink flex-1 truncate">{storeId}</code>
            <button
              onClick={() => copyToClipboard(storeId, "id")}
              className="p-2 hover:bg-bg-elev-2 rounded-md transition-colors text-ink-4 hover:text-ink"
            >
              {copied === "id" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* API Endpoint */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
            Point de terminaison (POST)
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-bg-elev border border-line p-1 pl-3">
            <code className="text-[12px] font-mono text-ink flex-1 truncate">{endpoint}</code>
            <button
              onClick={() => copyToClipboard(endpoint, "endpoint")}
              className="p-2 hover:bg-bg-elev-2 rounded-md transition-colors text-ink-4 hover:text-ink"
            >
              {copied === "endpoint" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="rounded-xl border border-line-soft bg-bg p-4 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase text-ink-4">Exemple d'envoi (JavaScript)</span>
          <a href="#" className="text-[11px] text-accent hover:underline flex items-center gap-1">
            Documentation complète <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <pre className="text-[11px] font-mono text-ink-3 overflow-x-auto whitespace-pre">
{`const payload = {
  storeId: "${storeId}",
  customerName: "Adama Traoré",
  customerPhone: "+22997000000",
  address: "Cadjehoun, Cotonou",
  items: [
    { productId: "prd_...", quantity: 1, price: 5000 }
  ]
};

fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});`}
        </pre>
      </div>
    </div>
  );
}
