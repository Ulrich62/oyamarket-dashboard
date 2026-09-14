"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteMember } from "@/lib/actions/team";
import { Role } from "@prisma/client";
import { 
  X, 
  Crown, 
  ShieldCheck, 
  Truck, 
  UserPlus, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  User, 
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLES: {
  role: Role;
  label: string;
  desc: string;
  icon: typeof Crown;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    role: "ADMIN",
    label: "Administrateur",
    desc: "Accès complet : paramètres, équipe, finances, produits et commandes.",
    icon: Crown,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
  },
  {
    role: "STAFF",
    label: "Staff Opérations",
    desc: "Gestion quotidienne : catalogue produits, commandes et médiathèque.",
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
  },
  {
    role: "DELIVERY",
    label: "Livreur COD",
    desc: "Accès mobile aux commandes qui lui sont assignées et mise à jour de statut.",
    icon: Truck,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
];

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [autoPassword, setAutoPassword] = useState(true);
  const [manualPassword, setManualPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Success summary state
  const [createdSummary, setCreatedSummary] = useState<{
    email: string;
    temporaryPassword?: string | null;
    isExistingUser: boolean;
    name: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("STAFF");
    setAutoPassword(true);
    setManualPassword("");
    setCreatedSummary(null);
    setCopied(false);
  };

  const handleClose = () => {
    if (isPending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Veuillez renseigner le nom complet");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Veuillez renseigner une adresse email valide");
      return;
    }
    if (!autoPassword && manualPassword.length < 6) {
      toast.error("Le mot de passe doit comporter au moins 6 caractères");
      return;
    }

    startTransition(async () => {
      try {
        const result = await inviteMember({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          role,
          password: autoPassword ? null : manualPassword,
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success(result.message || "Membre ajouté avec succès !");

        if (result.temporaryPassword) {
          setCreatedSummary({
            email: email.trim().toLowerCase(),
            temporaryPassword: result.temporaryPassword,
            isExistingUser: !!result.isExistingUser,
            name: name.trim(),
          });
        } else {
          handleClose();
        }

        onSuccess?.();
      } catch (err: any) {
        toast.error(err.message || "Une erreur est survenue");
      }
    });
  };

  const copyCredentials = () => {
    if (!createdSummary?.temporaryPassword) return;
    const text = `Bonjour ${createdSummary.name},\nVoici vos identifiants pour accéder à l'espace OyaMarket :\n• Email : ${createdSummary.email}\n• Mot de passe : ${createdSummary.temporaryPassword}\n• Connexion : https://app.oyamarket.shop/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Identifiants copiés dans le presse-papier !");
    setTimeout(() => setCopied(false), 3000);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose} 
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-[#111317] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line-soft">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                {createdSummary ? "Identifiants du collaborateur" : "Ajouter un collaborateur"}
              </h2>
              <p className="text-xs text-ink-3">
                {createdSummary
                  ? "Transmettez ces informations sécurisées au nouveau membre"
                  : "Invitez un admin, un gestionnaire ou un livreur"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-ink-4 hover:text-ink hover:bg-bg-elev transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdSummary ? (
          /* Step 2: Credentials display */
          <div className="py-4 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Le compte pour <strong>{createdSummary.name}</strong> a été configuré avec succès.
              </span>
            </div>

            <div className="rounded-xl border border-line bg-bg-elev/50 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-4">Email</span>
                <span className="text-ink font-sans font-medium">{createdSummary.email}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line-soft pt-2">
                <span className="text-ink-4">Mot de passe provisoire</span>
                <span className="text-accent font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                  {createdSummary.temporaryPassword}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line-soft pt-2">
                <span className="text-ink-4">Lien de connexion</span>
                <span className="text-ink-2 font-sans underline">https://app.oyamarket.shop/login</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                type="button"
                onClick={copyCredentials}
                icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                className="flex-1 justify-center"
              >
                {copied ? "Copié !" : "Copier les identifiants (WhatsApp / SMS)"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="justify-center"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          /* Step 1: Form */
          <form onSubmit={handleSubmit} className="py-4 space-y-4 overflow-y-auto pr-1">
            {/* Nom complet */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-mono text-ink-3 mb-1.5">
                Nom complet <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4" />
                <Input
                  type="text"
                  required
                  placeholder="ex: Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9.5"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-mono text-ink-3 mb-1.5">
                Adresse Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4" />
                <Input
                  type="email"
                  required
                  placeholder="collaborateur@oyamarket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9.5"
                />
              </div>
            </div>

            {/* Téléphone WhatsApp */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-mono text-ink-3 mb-1.5">
                Numéro de téléphone / WhatsApp <span className="text-ink-4 lowercase">(conseillé)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4" />
                <Input
                  type="tel"
                  placeholder="+229 97 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9.5"
                />
              </div>
            </div>

            {/* Sélecteur de Rôle */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-mono text-ink-3 mb-2">
                Rôle & Permissions <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRole(r.role)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3",
                        isSelected
                          ? `${r.bg} ${r.border} ring-1 ring-${r.color.replace("text-", "")}`
                          : "bg-bg-elev/40 border-line hover:bg-bg-elev"
                      )}
                    >
                      <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", r.bg, r.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-semibold", isSelected ? "text-ink" : "text-ink-2")}>
                            {r.label}
                          </span>
                          {isSelected && (
                            <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", r.color, r.bg, r.border)}>
                              Sélectionné
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-3 mt-0.5 leading-relaxed">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mot de passe */}
            <div className="rounded-xl border border-line bg-bg-elev/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-ink-4" />
                  <span className="text-xs font-medium text-ink">Mot de passe de connexion</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-ink-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPassword}
                    onChange={(e) => setAutoPassword(e.target.checked)}
                    className="rounded border-line bg-bg-elev text-accent focus:ring-accent accent-accent"
                  />
                  <span>Générer automatiquement</span>
                </label>
              </div>

              {!autoPassword && (
                <div className="relative pt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Définir un mot de passe (min. 6 caractères)"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line-soft">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={isPending}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Ajouter à l'équipe
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
