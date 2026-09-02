const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const prisma = new PrismaClient();

async function seed() {
  console.log("Authenticating with Supabase...");
  let { data, error } = await supabase.auth.signUp({
    email: "info@denemlabs.com",
    password: "Oyamarket@2026",
  });

  if (error) {
    if (error.message.includes("already registered")) {
        console.log("User already exists, trying login...");
        const res = await supabase.auth.signInWithPassword({
            email: "info@denemlabs.com",
            password: "Oyamarket@2026",
        });
        data = res.data;
        error = res.error;
    }
  }

  if (error) {
    console.error("Auth failed:", error.message);
    process.exit(1);
  }

  const userId = data.user.id;
  console.log("User authenticated, ID:", userId);

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
