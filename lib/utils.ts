import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalise un numéro de téléphone pour WhatsApp (wa.me/...)
 * Garantit la présence de l'indicatif international Bénin (229) et le plan à 10 chiffres ARCEP (01).
 * Ex: "01 96 00 00 00" -> "2290196000000"
 * Ex: "96000000" -> "2290196000000"
 * Ex: "+229 01 96 00 00 00" -> "2290196000000"
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  // Supprimer le préfixe 00 international si présent (ex: 00229... -> 229...)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Traitement spécifique Bénin (+229)
  if (digits.startsWith("229")) {
    const national = digits.slice(3);
    // Si l'indicatif 229 était suivi de 8 chiffres sans le préfixe ARCEP "01"
    if (national.length === 8) {
      return `22901${national}`;
    }
    return digits; // ex: 22901XXXXXXXX (13 chiffres)
  }

  // Format national 10 chiffres ARCEP (01XXXXXXXX)
  if (digits.length === 10 && digits.startsWith("01")) {
    return `229${digits}`; // -> 22901XXXXXXXX
  }

  // Ancien format national 8 chiffres sans le préfixe ARCEP "01"
  if (digits.length === 8) {
    return `22901${digits}`; // -> 22901XXXXXXXX
  }

  // Numéro local béninois avec un 0 initial (9 chiffres)
  if (digits.startsWith("0") && digits.length === 9) {
    return `22901${digits.slice(1)}`;
  }

  // Numéro sans indicatif mais 9 chiffres
  if (digits.length === 9) {
    return `22901${digits}`;
  }

  // Cas général : renvoyer les chiffres nettoyés
  return digits;
}
