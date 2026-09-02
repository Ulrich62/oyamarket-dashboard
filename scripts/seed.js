const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  console.log("Creating user info@denemlabs.com...");
  const hashedPassword = await bcrypt.hash("Oyamarket@2026", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "info@denemlabs.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "info@denemlabs.com",
      password: hashedPassword,
      name: "Admin",
    }
  });

  console.log("User created:", user.id);

  console.log("Creating store in Neon...");
  const store = await prisma.store.create({
    data: {
      name: "Boutique de Test",
      currency: "XOF",
      members: {
        create: {
          userId: user.id,
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
