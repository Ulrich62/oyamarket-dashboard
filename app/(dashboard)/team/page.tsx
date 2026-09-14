import { getTeamMembers } from "@/lib/actions/team";
import { getCurrentMemberContext } from "@/lib/actions/store-context";
import { TeamMembersList } from "@/components/team/team-members-list";
import { Crown, ShieldCheck, Truck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  let context;
  try {
    context = await getCurrentMemberContext();
  } catch {
    context = null;
  }

  if (!context) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink">Boutique introuvable</h1>
          <p className="text-xs text-ink-3 mt-1">
            Veuillez vous reconnecter ou sélectionner une boutique active.
          </p>
        </div>
        <Link href="/login">
          <Button size="sm">Se reconnecter</Button>
        </Link>
      </div>
    );
  }

  // Seul le rôle ADMIN a le droit de gérer l'équipe
  if (context.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="max-w-md">
          <h1 className="text-xl font-semibold text-ink">Accès réservé aux administrateurs</h1>
          <p className="text-xs text-ink-3 mt-1.5 leading-relaxed">
            Votre profil actuel (<strong>{context.role === "STAFF" ? "Staff Opérations" : "Livreur"}</strong>) ne dispose pas des privilèges nécessaires pour gérer les collaborateurs et les permissions de cette boutique.
          </p>
        </div>
        <Link href="/orders">
          <Button size="sm" variant="secondary">
            Retourner aux commandes
          </Button>
        </Link>
      </div>
    );
  }

  const members = await getTeamMembers();

  const adminCount = members.filter((m) => m.role === "ADMIN").length;
  const staffCount = members.filter((m) => m.role === "STAFF").length;
  const deliveryCount = members.filter((m) => m.role === "DELIVERY").length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
          Gestion de l&apos;Équipe
        </h1>
        <p className="text-xs sm:text-sm text-ink-3 mt-0.5">
          Gérez les rôles, invitez vos collaborateurs et configurez vos livreurs COD pour {context.store.name}.
        </p>
      </div>

      {/* Cartes KPI Rôles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center text-yellow-400 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-ink">{adminCount}</span>
              <span className="text-[11px] font-medium text-yellow-400">Admin{adminCount > 1 ? "s" : ""}</span>
            </div>
            <p className="text-[11px] text-ink-4 mt-0.5">Contrôle total & paramètres</p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-ink">{staffCount}</span>
              <span className="text-[11px] font-medium text-blue-400">Staff Opérations</span>
            </div>
            <p className="text-[11px] text-ink-4 mt-0.5">Catalogue, commandes & médias</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-ink">{deliveryCount}</span>
              <span className="text-[11px] font-medium text-emerald-400">Livreur{deliveryCount > 1 ? "s" : ""} COD</span>
            </div>
            <p className="text-[11px] text-ink-4 mt-0.5">Courses & livraison sur le terrain</p>
          </div>
        </div>
      </div>

      {/* Liste interactive & Modals */}
      <TeamMembersList
        initialMembers={members as any}
        currentUserId={context.userId}
        currentUserRole={context.role}
      />

      {/* Note RBAC informative */}
      <div className="rounded-xl border border-line-soft bg-bg-elev/20 p-4">
        <p className="text-[12px] text-ink-4 leading-relaxed">
          <span className="font-semibold text-ink-3">Sécurité & Permissions :</span>{" "}
          Seuls les administrateurs ont accès à cet écran. Une boutique doit impérativement conserver au minimum un administrateur actif. Les livreurs n&apos;ont accès qu&apos;aux commandes qui leur sont attribuées pour préserver la confidentialité des données clients et financières.
        </p>
      </div>
    </div>
  );
}

