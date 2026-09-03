"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
// We need an action to create a store. Let's create it later or now.
import { createStore } from "@/lib/actions/store";

export default function NewStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createStore(name);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Boutique créée avec succès !");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="rounded-2xl border border-line bg-bg-elev/30 p-8">
        <h1 className="text-2xl font-semibold text-ink mb-2">Créer une boutique</h1>
        <p className="text-sm text-ink-3 mb-8">
          Donnez un nom à votre nouvelle boutique pour commencer à gérer vos commandes.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            id="name"
            label="Nom de la boutique"
            placeholder="ex: Ma Super Boutique"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" loading={loading} disabled={!name.trim()}>
              Créer la boutique
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
