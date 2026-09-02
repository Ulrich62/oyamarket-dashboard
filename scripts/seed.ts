/**
 * Script de seed — Crée un utilisateur admin de test et une boutique OyaMarket
 *
 * Usage : npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const prisma = new PrismaClient();

const TEST_EMAIL = "admin@oyamarket.test";
const TEST_PASSWORD = "OyaAdmin2026!";
const STORE_NAME = "OyaMarket — Boutique Demo";

async function main() {
  console.log("🌱 Seeding OyaMarket...\n");

  // 1. Créer (ou récupérer) l'utilisateur admin
  let userId: string;

  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email === TEST_EMAIL);

  if (existing) {
    console.log(`✅ Utilisateur déjà existant : ${TEST_EMAIL}`);
    userId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    if (error || !data.user) {
      console.error("❌ Erreur création utilisateur:", error?.message);
      process.exit(1);
    }

    userId = data.user.id;
    console.log(`✅ Utilisateur créé : ${TEST_EMAIL}`);
  }

  // 2. Créer la boutique (si elle n'existe pas déjà)
  const existingMember = await prisma.storeMember.findFirst({
    where: { userId },
    include: { store: true },
  });

  let storeId: string;

  if (existingMember) {
    storeId = existingMember.storeId;
    console.log(`✅ Boutique déjà liée : ${existingMember.store.name}`);
  } else {
    const store = await prisma.store.create({
      data: {
        name: STORE_NAME,
        currency: "XOF",
        members: {
          create: { userId, role: "ADMIN" },
        },
      },
    });
    storeId = store.id;
    console.log(`✅ Boutique créée : ${STORE_NAME} (id: ${storeId})`);
  }

  // 3. Créer des produits de démo
  const existingProducts = await prisma.product.count({ where: { storeId } });

  if (existingProducts === 0) {
    await prisma.product.createMany({
      data: [
        {
          storeId,
          name: "Crème Hydratante Lumière",
          price: 15000,
          costPrice: 7000,
          isActive: true,
          imageUrl: null,
        },
        {
          storeId,
          name: "Huile Essentielle Karité",
          price: 9500,
          costPrice: 3500,
          isActive: true,
          imageUrl: null,
        },
        {
          storeId,
          name: "Savon Naturel Coco",
          price: 4500,
          costPrice: 1500,
          isActive: true,
          imageUrl: null,
        },
      ],
    });
    console.log("✅ 3 produits de démo créés");
  } else {
    console.log(`✅ Produits déjà existants (${existingProducts})`);
  }

  // 4. Créer des commandes de démo
  const existingOrders = await prisma.order.count({ where: { storeId } });

  if (existingOrders === 0) {
    const products = await prisma.product.findMany({ where: { storeId } });

    const DEMO_ORDERS = [
      { customerName: "Adama Traoré", customerPhone: "+229 97 11 22 33", quartier: "Cadjehoun, Cotonou", status: "DELIVERED" as const, productIdx: 0 },
      { customerName: "Fatou Diallo", customerPhone: "+229 96 44 55 66", quartier: "Fidjrossè, Cotonou", status: "CONFIRMED" as const, productIdx: 1 },
      { customerName: "Kofi Mensah", customerPhone: "+229 95 77 88 99", quartier: "Agla, Cotonou", status: "NEW" as const, productIdx: 2 },
      { customerName: "Aminata Sow", customerPhone: "+229 97 00 11 22", quartier: "Akpakpa, Cotonou", status: "PENDING_CONFIRMATION" as const, productIdx: 0 },
      { customerName: "Moussa Coulibaly", customerPhone: "+229 96 33 44 55", quartier: "Gbèdjromèdji, Cotonou", status: "SHIPPED" as const, productIdx: 1 },
    ];

    for (const demo of DEMO_ORDERS) {
      const product = products[demo.productIdx];
      await prisma.order.create({
        data: {
          storeId,
          customerName: demo.customerName,
          customerPhone: demo.customerPhone,
          quartier: demo.quartier,
          status: demo.status,
          totalAmount: product.price,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              price: product.price,
            },
          },
        },
      });
    }
    console.log("✅ 5 commandes de démo créées");
  } else {
    console.log(`✅ Commandes déjà existantes (${existingOrders})`);
  }

  console.log("\n🎉 Seed terminé !\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email     :", TEST_EMAIL);
  console.log("🔑 Mot de passe :", TEST_PASSWORD);
  console.log("🏪 Boutique  :", STORE_NAME);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
