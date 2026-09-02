/**
 * Script de seed via l'API REST Supabase (PostgREST)
 * Evite le blocage du port 5432 sur Supabase Free
 *
 * Usage : npx tsx --env-file=.env scripts/seed-rest.ts
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Génère un ID compatible cuid (25 chars)
function genId(): string {
  return "c" + randomBytes(12).toString("hex");
}

const TEST_EMAIL = "admin@oyamarket.test";
const TEST_PASSWORD = "OyaAdmin2026!";
const STORE_NAME = "OyaMarket — Boutique Demo";

async function main() {
  console.log("🌱 Seeding OyaMarket via REST...\n");

  // 1. Récupérer ou créer l'utilisateur admin
  let userId: string;
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listError) { console.error("❌ listUsers:", listError.message); process.exit(1); }

  const existing = listData?.users?.find((u) => u.email === TEST_EMAIL);

  if (existing) {
    userId = existing.id;
    console.log(`✅ Utilisateur existant : ${TEST_EMAIL} (${userId})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) { console.error("❌ createUser:", error?.message); process.exit(1); }
    userId = data.user.id;
    console.log(`✅ Utilisateur créé : ${TEST_EMAIL} (${userId})`);
  }

  // 2. Créer la boutique via l'API REST
  let storeId: string;

  const { data: existingMember } = await supabase
    .from("StoreMember")
    .select("storeId")
    .eq("userId", userId)
    .maybeSingle();

  if (existingMember) {
    storeId = existingMember.storeId;
    console.log(`✅ Boutique déjà liée : storeId=${storeId}`);
  } else {
    const { data: store, error: storeErr } = await supabase
      .from("Store")
      .insert({ id: genId(), name: STORE_NAME, currency: "XOF" })
      .select()
      .single();

    if (storeErr || !store) { console.error("❌ Store:", storeErr?.message); process.exit(1); }
    storeId = store.id;

    const { error: memberErr } = await supabase
      .from("StoreMember")
      .insert({ id: genId(), userId, storeId, role: "ADMIN" });

    if (memberErr) { console.error("❌ StoreMember:", memberErr?.message); process.exit(1); }
    console.log(`✅ Boutique créée : ${STORE_NAME}`);
  }

  // 3. Créer les produits
  const { data: existingProducts } = await supabase
    .from("Product")
    .select("id")
    .eq("storeId", storeId);

  let productIds: string[] = [];

  if (!existingProducts || existingProducts.length === 0) {
    const { data: products, error: prodErr } = await supabase
      .from("Product")
      .insert([
        { id: genId(), storeId, name: "Crème Hydratante Lumière", price: 15000, costPrice: 7000, isActive: true },
        { id: genId(), storeId, name: "Huile Essentielle Karité", price: 9500, costPrice: 3500, isActive: true },
        { id: genId(), storeId, name: "Savon Naturel Coco", price: 4500, costPrice: 1500, isActive: true },
      ])
      .select("id, price");

    if (prodErr || !products) { console.error("❌ Products:", prodErr?.message); process.exit(1); }
    productIds = products.map((p) => p.id);
    console.log(`✅ ${products.length} produits créés`);
  } else {
    productIds = existingProducts.map((p) => p.id);
    console.log(`✅ Produits existants (${productIds.length})`);
  }

  // 4. Créer des commandes de démo
  const { data: existingOrders } = await supabase
    .from("Order")
    .select("id")
    .eq("storeId", storeId);

  if (!existingOrders || existingOrders.length === 0) {
    const PRICES = [15000, 9500, 4500];
    const DEMO_ORDERS = [
      { customerName: "Adama Traoré", customerPhone: "+229 97 11 22 33", quartier: "Cadjehoun, Cotonou", status: "DELIVERED", productIdx: 0 },
      { customerName: "Fatou Diallo", customerPhone: "+229 96 44 55 66", quartier: "Fidjrossè, Cotonou", status: "CONFIRMED", productIdx: 1 },
      { customerName: "Kofi Mensah", customerPhone: "+229 95 77 88 99", quartier: "Agla, Cotonou", status: "NEW", productIdx: 2 },
      { customerName: "Aminata Sow", customerPhone: "+229 97 00 11 22", quartier: "Akpakpa, Cotonou", status: "PENDING_CONFIRMATION", productIdx: 0 },
      { customerName: "Moussa Coulibaly", customerPhone: "+229 96 33 44 55", quartier: "Gbèdjromèdji, Cotonou", status: "SHIPPED", productIdx: 1 },
    ];

    for (const demo of DEMO_ORDERS) {
      const price = PRICES[demo.productIdx];
      const orderId = genId();
      const now = new Date().toISOString();
      const { error: orderErr } = await supabase
        .from("Order")
        .insert({
          id: orderId,
          storeId,
          customerName: demo.customerName,
          customerPhone: demo.customerPhone,
          quartier: demo.quartier,
          status: demo.status,
          totalAmount: price,
          createdAt: now,
          updatedAt: now,
        });

      if (orderErr) { console.error("❌ Order:", orderErr?.message); continue; }

      await supabase.from("OrderItem").insert({
        id: genId(),
        orderId,
        productId: productIds[demo.productIdx],
        quantity: 1,
        price,
      });
    }
    console.log(`✅ ${DEMO_ORDERS.length} commandes de démo créées`);
  } else {
    console.log(`✅ Commandes existantes (${existingOrders.length})`);
  }

  console.log("\n🎉 Seed terminé !\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email        :", TEST_EMAIL);
  console.log("🔑 Mot de passe :", TEST_PASSWORD);
  console.log("🏪 Boutique     :", STORE_NAME);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
