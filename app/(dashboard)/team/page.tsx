import { getTeamMembers } from "@/lib/actions/team";
import { Users, ShieldCheck, Truck, Crown } from "lucide-react";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  ADMIN: {
    label: "Admin",
    icon: <Crown className="w-3.5 h-3.5" />,
    description: "Accès total",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  STAFF: {
    label: "Staff",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    description: "Commandes & produits",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  DELIVERY: {
    label: "Livreur",
    icon: <Truck className="w-3.5 h-3.5" />,
    description: "Commandes assignées uniquement",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
};

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Équipe</h1>
          <p className="text-sm text-ink-3 mt-0.5">
            {members.length} membre{members.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Légende des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div
            key={role}
            className="rounded-xl border border-line bg-bg-elev/30 p-4 flex items-start gap-3"
          >
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border ${cfg.color}`}>
              {cfg.icon}
              {cfg.label}
            </span>
            <p className="text-[12px] text-ink-3 mt-0.5">{cfg.description}</p>
          </div>
        ))}
      </div>

      {/* Membres */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-bg-elev/30 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-elev flex items-center justify-center">
            <Users className="w-7 h-7 text-ink-3" />
          </div>
          <div>
            <p className="text-ink font-medium">Aucun membre</p>
            <p className="text-ink-3 text-sm mt-1">
              Invitez des membres via les paramètres Supabase Auth.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Utilisateur (ID)
                </th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-4 font-mono font-medium">
                  Rôle
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const cfg = ROLE_CONFIG[member.role];
                return (
                  <tr
                    key={member.id}
                    className="border-b border-line-soft last:border-0 hover:bg-bg-elev/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px] text-ink-3">
                        {member.userId.slice(0, 12)}…
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info RBAC */}
      <div className="rounded-xl border border-line-soft bg-bg-elev/20 p-4">
        <p className="text-[12px] text-ink-4">
          <span className="font-medium text-ink-3">Note RBAC :</span>{" "}
          Les permissions sont appliquées côté serveur via Row Level Security (RLS) Supabase.
          Les livreurs ne voient que les commandes qui leur sont assignées.
          Invitez de nouveaux membres via votre tableau de bord Supabase.
        </p>
      </div>
    </div>
  );
}
