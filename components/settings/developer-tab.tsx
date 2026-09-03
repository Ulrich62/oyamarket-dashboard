"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Terminal,
  ShoppingBag,
  PackageSearch,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://oyamarket.vercel.app";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  icon: React.ReactNode;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  example: string;
  response: string;
}

function getEndpoints(storeId: string): Endpoint[] {
  return [
    {
      method: "GET",
      path: "/api/v1/products",
      description: "Liste tous les produits actifs de la boutique.",
      icon: <PackageSearch className="w-4 h-4" />,
      params: [
        { name: "storeId", type: "string", required: true, description: "Identifiant de la boutique" },
      ],
      example: `fetch("${BASE_URL}/api/v1/products?storeId=${storeId}")
  .then(res => res.json())
  .then(data => console.log(data.products));`,
      response: `{
  "products": [
    {
      "id": "prd_abc123",
      "name": "Robe en wax",
      "price": 8500,
      "imageUrl": "https://..."
    }
  ]
}`,
    },
    {
      method: "POST",
      path: "/api/v1/orders",
      description: "Crée une commande depuis le formulaire de la boutique.",
      icon: <ShoppingBag className="w-4 h-4" />,
      body: [
        { name: "storeId", type: "string", required: true, description: "Identifiant de la boutique" },
        { name: "customerName", type: "string", required: true, description: "Nom complet du client" },
        { name: "customerPhone", type: "string", required: true, description: "Téléphone du client" },
        { name: "quartier", type: "string", required: false, description: "Zone / quartier de livraison" },
        { name: "fbc", type: "string", required: false, description: "Cookie _fbc (Facebook Click ID)" },
        { name: "fbp", type: "string", required: false, description: "Cookie _fbp (Facebook Browser ID)" },
        {
          name: "items",
          type: "Array<{productId, quantity, price}>",
          required: true,
          description: "Liste des articles commandés",
        },
      ],
      example: `fetch("${BASE_URL}/api/v1/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    storeId: "${storeId}",
    customerName: "Adama Traoré",
    customerPhone: "+22997000000",
    quartier: "Cadjehoun, Cotonou",
    fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1],
    fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1],
    items: [
      { productId: "prd_abc123", quantity: 1, price: 8500 }
    ]
  })
}).then(res => res.json());`,
      response: `{
  "success": true,
  "order": {
    "id": "cmd_xyz789",
    "status": "NEW",
    "totalAmount": 8500,
    "createdAt": "2026-09-03T08:00:00.000Z"
  }
}`,
    },
  ];
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title={`Copier ${label}`}
      className="p-1.5 rounded-md hover:bg-bg-elev-2 transition-colors text-ink-4 hover:text-ink"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const methodColor =
    ep.method === "GET"
      ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
      : "text-accent bg-accent/10 border-accent/20";

  return (
    <div className="rounded-xl border border-line bg-bg-elev/40 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-elev/60 transition-colors text-left"
      >
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-bold tracking-wider ${methodColor}`}
        >
          {ep.method}
        </span>
        <code className="text-[13px] font-mono text-ink flex-1">{ep.path}</code>
        <span className="text-[12px] text-ink-3 hidden sm:block truncate max-w-[260px]">
          {ep.description}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-ink-4 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-4 shrink-0" />
        )}
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-line px-4 py-4 flex flex-col gap-5">
          <p className="text-[12px] text-ink-3">{ep.description}</p>

          {/* Params / Body */}
          {(ep.params || ep.body) && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-2">
                {ep.params ? "Query params" : "Request body (JSON)"}
              </p>
              <div className="rounded-lg border border-line overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-line bg-bg-elev/60">
                      <th className="text-left px-3 py-2 text-ink-4 font-mono font-medium">Champ</th>
                      <th className="text-left px-3 py-2 text-ink-4 font-mono font-medium">Type</th>
                      <th className="text-left px-3 py-2 text-ink-4 font-mono font-medium">Requis</th>
                      <th className="text-left px-3 py-2 text-ink-4 font-mono font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ep.params ?? ep.body)?.map((p) => (
                      <tr key={p.name} className="border-b border-line last:border-0">
                        <td className="px-3 py-2 font-mono text-ink">{p.name}</td>
                        <td className="px-3 py-2 text-blue-400 font-mono">{p.type}</td>
                        <td className="px-3 py-2">
                          {p.required ? (
                            <span className="text-accent text-[10px] font-bold">OUI</span>
                          ) : (
                            <span className="text-ink-4 text-[10px]">non</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-ink-3">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Code Example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono">
                Exemple (JavaScript)
              </p>
              <CopyButton text={ep.example} label="l'exemple" />
            </div>
            <pre className="rounded-lg bg-bg border border-line p-3 text-[11px] font-mono text-ink-3 overflow-x-auto whitespace-pre">
              {ep.example}
            </pre>
          </div>

          {/* Response */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono mb-2">
              Réponse (200/201)
            </p>
            <pre className="rounded-lg bg-bg border border-line p-3 text-[11px] font-mono text-green-400/80 overflow-x-auto whitespace-pre">
              {ep.response}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export function DeveloperTab({ storeId }: { storeId: string }) {
  const [copiedId, setCopiedId] = useState(false);
  const endpoints = getEndpoints(storeId);

  const copyStoreId = () => {
    navigator.clipboard.writeText(storeId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Store ID */}
      <div className="rounded-2xl border border-line bg-bg-elev/30 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            Identifiants d&apos;intégration
          </h2>
          <p className="text-[12px] text-ink-3 mt-1">
            Utilisez ces informations pour connecter votre boutique à l&apos;API OyaMarket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
              Store ID
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-bg-elev border border-line p-1 pl-3">
              <code className="text-[12px] font-mono text-ink flex-1 truncate">{storeId}</code>
              <button
                onClick={copyStoreId}
                className="p-2 hover:bg-bg-elev-2 rounded-md transition-colors text-ink-4 hover:text-ink"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-[10px] uppercase tracking-[0.14em] text-ink-3 font-mono">
              Base URL
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-bg-elev border border-line p-1 pl-3">
              <code className="text-[12px] font-mono text-ink-3 flex-1 truncate">{BASE_URL}/api/v1</code>
              <CopyButton text={`${BASE_URL}/api/v1`} label="la base URL" />
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Endpoints disponibles</h2>
          <a
            href="https://github.com/Ulrich62/oyamarket-dashboard#api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-ink-3 hover:text-ink transition-colors flex items-center gap-1"
          >
            Documentation GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {endpoints.map((ep) => (
          <EndpointCard key={`${ep.method}-${ep.path}`} ep={ep} />
        ))}
      </div>

      {/* Tracking Meta note */}
      <div className="rounded-xl border border-line-soft bg-accent/5 p-4 flex flex-col gap-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-accent">
          🔥 Tracking Meta — important
        </p>
        <p className="text-[12px] text-ink-3">
          Passez les cookies <code className="text-accent bg-accent/10 px-1 rounded text-[11px]">_fbc</code> et{" "}
          <code className="text-accent bg-accent/10 px-1 rounded text-[11px]">_fbp</code> dans chaque commande pour
          activer le matching côté serveur (CAPI). L&apos;événement{" "}
          <code className="text-accent bg-accent/10 px-1 rounded text-[11px]">Purchase</code> est envoyé
          automatiquement lorsqu&apos;une commande passe au statut <strong className="text-ink">Livrée</strong>.
        </p>
      </div>
    </div>
  );
}
