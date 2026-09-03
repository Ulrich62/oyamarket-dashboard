"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Plus, Store as StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { switchStore } from "@/lib/actions/store-context";

interface StoreSwitcherProps {
  stores: { storeId: string; store: { name: string } }[];
  currentStoreId: string;
}

export function StoreSwitcher({ stores, currentStoreId }: StoreSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (storeId: string) => {
    if (storeId === "new") {
      router.push("/new-store"); // TODO: Implémenter la page ou le modal de création
      return;
    }
    
    startTransition(async () => {
      await switchStore(storeId);
      router.refresh();
    });
  };

  const currentStore = stores.find((s) => s.storeId === currentStoreId)?.store;

  return (
    <div className="w-full">
      <Select value={currentStoreId} onValueChange={handleSwitch} disabled={isPending}>
        <SelectTrigger className="h-10 bg-bg hover:bg-bg-elev border-transparent hover:border-line-soft transition-colors focus:ring-0 shadow-none">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center shrink-0">
              <StoreIcon className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-semibold text-ink text-[13px] truncate">
              {currentStore?.name || "Sélectionnez..."}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-4">Boutiques</p>
          </div>
          {stores.map((s) => (
            <SelectItem key={s.storeId} value={s.storeId} className="text-[13px]">
              {s.store.name}
            </SelectItem>
          ))}
          <div className="h-px bg-line my-1" />
          <Button 
            variant="ghost" 
            className="w-full justify-start text-[13px] text-ink-3 hover:text-ink h-8 px-2 py-1.5"
            onClick={() => handleSwitch("new")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une boutique
          </Button>
        </SelectContent>
      </Select>
    </div>
  );
}
