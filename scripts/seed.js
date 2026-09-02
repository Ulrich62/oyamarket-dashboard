const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const prisma = new PrismaClient();

async function seed() {
  const userId = "eaa65392-be29-45c4-ad0d-fc9c9cda070e";
  console.log("Using known user ID:", userId);

  console.log("Creating store in Neon...");
  const store = await prisma.store.create({
    data: {
      name: "Boutique de Test",
      currency: "XOF",
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
      products: {
        create: [
          { name: "Montre Connectée Pro", price: 25000, costPrice: 10000 },
          { name: "Écouteurs Sans Fil", price: 15000, costPrice: 5000 },
        ]
      }
    },
    include: {
      members: true,
      products: true,
    }
  });

  console.log("Store and products created successfully!");
  console.log(store);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
