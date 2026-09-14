const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const STORE_ID = process.env.STORE_ID || "cmtxoxqor000112jrigl2lu6w";

async function main() {
  console.log("🚀 Début de l'insertion / mise à jour du produit Ceinture EMS Pro...");

  const dataFilePath = path.join(__dirname, "../data/products/ceinture-abdominale-ems.json");
  const rawData = fs.readFileSync(dataFilePath, "utf-8");
  const { product, landingData } = JSON.parse(rawData);

  // 1. Créer ou mettre à jour le produit
  const upsertedProduct = await prisma.product.upsert({
    where: {
      storeId_slug: {
        storeId: STORE_ID,
        slug: product.slug,
      },
    },
    update: {
      name: product.name,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured,
      featuredOrder: product.featuredOrder,
      landingData: landingData,
    },
    create: {
      storeId: STORE_ID,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isFeatured: product.isFeatured,
      featuredOrder: product.featuredOrder,
      landingData: landingData,
    },
  });

  console.log(`✅ Produit enregistré avec succès : ${upsertedProduct.name} (ID: ${upsertedProduct.id})`);

  // 2. Supprimer les anciens packs s'ils existent et réinsérer les 3 packs
  await prisma.productPack.deleteMany({
    where: { productId: upsertedProduct.id },
  });

  for (const pack of product.packs) {
    await prisma.productPack.create({
      data: {
        productId: upsertedProduct.id,
        name: pack.name,
        subtitle: pack.subtitle,
        badge: pack.badge,
        quantity: pack.quantity,
        price: pack.price,
        compareAtPrice: pack.compareAtPrice,
        isPopular: pack.isPopular,
        position: pack.position,
      },
    });
  }

  console.log(`✅ ${product.packs.length} packs configurés et associés au produit.`);
  console.log("🎉 Opération terminée avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'insertion :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
