import { z } from "zod";

export const ProductPackSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().optional().default(""),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive(),
  badge: z.string().optional(),
  isPopular: z.boolean().optional().default(false),
});

export const TrustBadgeSchema = z.object({
  icon: z.string().url().or(z.string()),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});

export const UgcVideoSchema = z.object({
  videoUrl: z.string().url().or(z.string()),
  poster: z.string().url().or(z.string()),
  caption: z.string().min(1),
  stars: z.number().int().min(1).max(5).default(5),
});

export const StepSchema = z.object({
  num: z.string().min(1),
  title: z.string().min(1),
  desc: z.string().min(1),
});

export const ReviewSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  avatar: z.string().url().or(z.string()),
  badge: z.string().default("Achat vérifié"),
  stars: z.number().int().min(1).max(5).default(5),
  text: z.string().min(1),
});

export const AccordionItemSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  defaultOpen: z.boolean().optional().default(false),
});

export const FaqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const ProductLandingDataSchema = z.object({
  packs: z.array(ProductPackSchema).default([]),
  gallery: z.array(z.string()).default([]),
  trustBadges: z.array(TrustBadgeSchema).default([]),
  videos: z.array(UgcVideoSchema).default([]),
  steps: z.array(StepSchema).default([]),
  beforeAfter: z.object({
    badge: z.string().default("Résultats Visibles"),
    title: z.string().default("Dites adieu aux points noirs"),
    description: z.string().default("Une peau purifiée dès la première utilisation."),
    image: z.string().default(""),
    benefits: z.array(z.object({
      title: z.string(),
      desc: z.string(),
    })).default([]),
  }).optional(),
  benefitCards: z.array(z.object({
    title: z.string(),
    desc: z.string(),
  })).default([]),
  reviews: z.array(ReviewSchema).default([]),
  clientPhotos: z.array(z.string()).default([]),
  unboxing: z.object({
    image: z.string().default(""),
    title: z.string().default("Ce que contient votre coffret"),
    items: z.array(z.string()).default([]),
    ctaText: z.string().default("Commander mon coffret"),
  }).optional(),
  accordions: z.array(AccordionItemSchema).default([]),
  faq: z.array(FaqItemSchema).default([]),
});

export type ProductPack = z.infer<typeof ProductPackSchema>;
export type TrustBadge = z.infer<typeof TrustBadgeSchema>;
export type UgcVideo = z.infer<typeof UgcVideoSchema>;
export type UsageStep = z.infer<typeof StepSchema>;
export type ProductReview = z.infer<typeof ReviewSchema>;
export type AccordionItem = z.infer<typeof AccordionItemSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
export type ProductLandingData = z.infer<typeof ProductLandingDataSchema>;
