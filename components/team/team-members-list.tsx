"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { updateMemberRole, removeMember } from "@/lib/actions/team";
import { formatDate } from "@/lib/constants";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Crown, 
  ShieldCheck, 
  Truck, 
  Trash2, 
  Phone, 
  MessageCircle, 
  Mail, 
  UserPlus, 
  Users,
  ShieldAlert,
  ChevronDown
} from "lucide-react";
import { InviteMemberModal } from "./invite-member-modal";
import { cn } from "@/lib/utils";

export interface TeamMemberItem {
  id: string;
  userId: string;
  storeId: string;
  role: Role;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
    createdAt: Date | string;
  };
}

interface TeamMembersListProps {
  initialMembers: TeamMemberItem[];
  currentUserId: string;
  currentUserRole: Role;
}

export const ROLE_INFO: Record<
  Role,
  {
    label: string;
    icon: typeof Crown;
    color: string;
    bg: string;
    border: string;
  }
> = {
  ADMIN: {
    label: "Admin",
    icon: Crown,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/25",
  },
  STAFF: {
    label: "Staff",
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/25",
  },
  DELIVERY: {
    label: "Livreur",
    icon: Truck,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/25",
  },
};

export function TeamMembersList({
  initialMembers,
  currentUserId,
  currentUserRole,
}: TeamMembersListProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberItem[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMemberItem | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = currentUserRole === "ADMIN";

  // Compter le nombre d'admins actuels
  const adminCount = useMemo(
    () => members.filter((m) => m.role === "ADMIN").length,
    [members]
  );

  // Filtrer les membres
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filtre rôle
      if (roleFilter !== "ALL" && m.role !== roleFilter) return false;

      // Filtre texte
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = m.user.name?.toLowerCase().includes(q) ?? false;
        const emailMatch = m.user.email?.toLowerCase().includes(q) ?? false;
        const phoneMatch = m.user.phone?.toLowerCase().includes(q) ?? false;
        return nameMatch || emailMatch || phoneMatch;
      }

      return true;
    });
  }, [members, roleFilter, search]);

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setUpdatingId(memberId);
    const prevMembers = members;
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    try {
      const result = await updateMemberRole(memberId, newRole);
      if (result.error) {
        setMembers(prevMembers);
        toast.error(result.error);
      } else {
        toast.success(result.message || "Rôle mis à jour");
        router.refresh();
      }
    } catch (err: any) {
      setMembers(prevMembers);
      toast.error(err.message || "Erreur lors du changement de rôle");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!memberToDelete) return;

    const targetId = memberToDelete.id;
    const prevMembers = members;
    setMembers((prev) => prev.filter((m) => m.id !== targetId));

    startDeleteTransition(async () => {
      try {
        const result = await removeMember(targetId);
        if (result.error) {
          setMembers(prevMembers);
          toast.error(result.error);
        } else {
          toast.success(result.message || "Membre retiré de l'équipe");
          setMemberToDelete(null);
          router.refresh();
        }
      } catch (err: any) {
        setMembers(prevMembers);
        toast.error(err.message || "Erreur lors de la suppression");
      }
    });
  };

  const counts = useMemo(() => {
    return {
      ALL: members.length,
      ADMIN: members.filter((m) => m.role === "ADMIN").length,
      STAFF: members.filter((m) => m.role === "STAFF").length,
      DELIVERY: members.filter((m) => m.role === "DELIVERY").length,
    };
  }, [members]);

  return (
    <div className="flex flex-col gap-5">
      {/* Action Bar: Search + Role Pills + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-elev/60 border border-line rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-ink-4 focus:border-ink-3 focus:outline-none transition-colors"
          />
        </div>

        {/* Action Button */}
        {isAdmin && (
          <Button
            onClick={() => setInviteModalOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
            size="sm"
            className="shrink-0 justify-center"
          >
            Inviter un collaborateur
          </Button>
        )}
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "ALL", label: "Tous" },
          { key: "ADMIN", label: "Admins" },
          { key: "STAFF", label: "Staff" },
          { key: "DELIVERY", label: "Livreurs" },
        ].map((tab) => {
          const isActive = roleFilter === tab.key;
          const count = counts[tab.key as keyof typeof counts] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0",
                isActive
                  ? "bg-bg-elev-2 border-ink-3 text-ink"
                  : "bg-bg-elev/40 border-line text-ink-3 hover:text-ink hover:bg-bg-elev"
              )}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-bg-elev-2 text-ink-3">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table / List View */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-bg-elev/20 py-16 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-bg-elev flex items-center justify-center text-ink-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-ink font-medium text-sm">Aucun membre trouvé</p>
            <p className="text-ink-4 text-xs mt-1">
              {search
                ? "Aucun collaborateur ne correspond à vos critères de recherche."
                : "Commencez par ajouter un collaborateur à cette boutique."}
            </p>
          </div>
          {isAdmin && !search && (
            <Button
              size="sm"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => setInviteModalOpen(true)}
              className="mt-2"
            >
              Inviter un collaborateur
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-bg-elev/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-bg-elev/50">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-mono text-ink-4 font-medium">
                    Collaborateur
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-mono text-ink-4 font-medium">
                    Contact & WhatsApp
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-mono text-ink-4 font-medium">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-mono text-ink-4 font-medium hidden md:table-cell">
                    Adhésion
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-mono text-ink-4 font-medium text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filteredMembers.map((member) => {
                  const isSelf = member.userId === currentUserId;
                  const isLastAdmin = member.role === "ADMIN" && adminCount <= 1;
                  const roleConfig = ROLE_INFO[member.role];
                  const Icon = roleConfig.icon;
                  const initial = (member.user.name || member.user.email || "U")
                    .slice(0, 2)
                    .toUpperCase();
                  const cleanPhone = member.user.phone?.replace(/\D/g, "");

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-bg-elev/40 transition-colors"
                    >
                      {/* Collaborateur */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] select-none border shrink-0",
                              member.role === "ADMIN"
                                ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"
                                : member.role === "STAFF"
                                ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            )}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-ink truncate text-[13px]">
                                {member.user.name || "Sans nom"}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-accent/15 text-accent border border-accent/25">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="text-ink-4 text-[11px] block truncate">
                              {member.user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        {member.user.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="text-ink-2 font-mono text-[11px]">
                              {member.user.phone}
                            </span>
                            <div className="flex items-center gap-1">
                              {/* WhatsApp link */}
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                                  title="Contacter sur WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {/* Phone call link */}
                              <a
                                href={`tel:${member.user.phone}`}
                                className="p-1 rounded-md text-blue-400 hover:bg-blue-500/15 transition-colors"
                                title="Appeler"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-4 italic text-[11px]">
                            Aucun numéro
                          </span>
                        )}
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-3.5">
                        {isAdmin ? (
                          <div className="relative inline-block">
                            <select
                              value={member.role}
                              disabled={updatingId === member.id || isLastAdmin}
                              onChange={(e) =>
                                handleRoleChange(member.id, e.target.value as Role)
                              }
                              className={cn(
                                "appearance-none pl-2.5 pr-7 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors focus:outline-none",
                                roleConfig.bg,
                                roleConfig.color,
                                roleConfig.border,
                                (updatingId === member.id || isLastAdmin) &&
                                  "opacity-70 cursor-not-allowed"
                              )}
                            >
                              <option value="ADMIN" className="bg-[#121214] text-yellow-400">
                                Admin (Accès total)
                              </option>
                              <option value="STAFF" className="bg-[#121214] text-blue-400">
                                Staff (Opérations)
                              </option>
                              <option value="DELIVERY" className="bg-[#121214] text-emerald-400">
                                Livreur (Livraisons)
                              </option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-60" />
                          </div>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border",
                              roleConfig.bg,
                              roleConfig.color,
                              roleConfig.border
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {roleConfig.label}
                          </span>
                        )}
                        {isLastAdmin && (
                          <p className="text-[10px] text-ink-4 mt-1 font-mono">
                            Dernier administrateur
                          </p>
                        )}
                      </td>

                      {/* Adhésion */}
                      <td className="px-4 py-3.5 text-ink-3 hidden md:table-cell text-[11px]">
                        {formatDate(member.createdAt)}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            disabled={isSelf || isLastAdmin}
                            onClick={() => setMemberToDelete(member)}
                            title={
                              isSelf
                                ? "Vous ne pouvez pas retirer votre propre compte"
                                : isLastAdmin
                                ? "Impossible de retirer le seul administrateur"
                                : "Retirer ce membre de l'équipe"
                            }
                            className={cn(
                              "p-1.5 rounded-lg transition-colors inline-flex items-center justify-center",
                              isSelf || isLastAdmin
                                ? "text-ink-4/30 cursor-not-allowed"
                                : "text-ink-4 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'invitation */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Confirmation Modal pour suppression */}
      <ConfirmModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Retirer ce membre de l'équipe ?"
        description={
          memberToDelete
            ? `Êtes-vous certain de vouloir retirer ${memberToDelete.user.name || memberToDelete.user.email} (${ROLE_INFO[memberToDelete.role].label}) de cette boutique ? Cette action révoquera immédiatement tous ses accès.`
            : ""
        }
        confirmText="Retirer définitivement"
        cancelText="Conserver"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
