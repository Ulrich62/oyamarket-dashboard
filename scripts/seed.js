const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const STORE_ID = "cmtxoxqor000112jrigl2lu6w";

async function main() {
  console.log("🌱 Démarrage du seed complet OyaMarket...");

  // 0. Nettoyage des données existantes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productPack.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeMember.deleteMany();
  await prisma.store.deleteMany();
  console.log("🧹 Données précédentes nettoyées.");

  // 1. Utilisateurs Administrateurs
  const hashedPassword = await bcrypt.hash("Oyamarket@2026", 10);
  const adminConfigs = [
    { email: "adimiulrich06@gmail.com", name: "Ulrich Adimi (Admin)" },
    { email: "info@denemlabs.com", name: "Admin DenemLabs" },
  ];
  const adminUsers = [];
  for (const config of adminConfigs) {
    const u = await prisma.user.upsert({
      where: { email: config.email },
      update: {
        password: hashedPassword,
        name: config.name,
      },
      create: {
        email: config.email,
        password: hashedPassword,
        name: config.name,
      },
    });
    adminUsers.push(u);
    console.log("✅ Admin créé/actualisé :", u.email);
  }

  // 2. Boutique Officielle OyaMarket Bénin
  const store = await prisma.store.create({
    data: {
      id: STORE_ID,
      name: "OyaMarket Bénin",
      currency: "XOF",
      pixelId: "128491829481928",
      capiToken: "EAAB_mock_capi_token_oyamarket_benin",
      supportEmail: "contact@oyamarket.shop",
      homeData: {
        announcements: [
          "Paiement à la livraison partout au Bénin 🇧🇯 🛵",
          "Livraison GRATUITE dès 25.000 FCFA d'achat 🎁",
        ],
        hero: {
          title: "L'Excellence, Livrée.",
          subtitle:
            "OyaMarket redéfinit les standards du shopping au Bénin. Une sélection pointue, un service irréprochable et un paiement sécurisé à la livraison.",
          ctaText: "Découvrir la Boutique",
          ctaLink: "/boutique",
          image:
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
        },
      },
      members: {
        create: adminUsers.map((u) => ({
          userId: u.id,
          role: "ADMIN",
        })),
      },
    },
  });
  console.log("✅ Boutique créée :", store.name, `(${store.id})`);

  // 3. Produit Vedette : Aspirateur Points Noirs 3-en-1 Pro avec Landing Page Complète
  const aspirateurLandingData = {
    packs: [
      {
        id: 1,
        quantity: 1,
        title: "1x Aspirateur Points Noirs",
        subtitle: "Kit complet avec 5 embouts",
        price: 15000,
        originalPrice: 25000,
        isPopular: false,
      },
      {
        id: 2,
        quantity: 2,
        title: "2x Aspirateurs Points Noirs",
        subtitle: "Offrez-en un à un proche (-5 000 FCFA)",
        price: 25000,
        originalPrice: 45000,
        badge: "PLUS POPULAIRE 🔥",
        isPopular: true,
      },
    ],
    gallery: [
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231151/oyamarket/products/aspirateur-points-noirs/sebum_brillance.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231160/oyamarket/products/aspirateur-points-noirs/aspiration_nez.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231166/oyamarket/products/aspirateur-points-noirs/avant_apres.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231168/oyamarket/products/aspirateur-points-noirs/trois_problemes.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231170/oyamarket/products/aspirateur-points-noirs/preuve_extraction.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231173/oyamarket/products/aspirateur-points-noirs/routine_maison.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231178/oyamarket/products/aspirateur-points-noirs/securite_conseils.jpg",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231185/oyamarket/products/aspirateur-points-noirs/unboxing_coffret.jpg",
    ],
    trustBadges: [
      {
        icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232043/oyamarket/icons/icon_livraison.png",
        title: "Livraison gratuite",
        subtitle: "Partout au Bénin (24-48h)",
      },
      {
        icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232045/oyamarket/icons/icon_paiement.png",
        title: "Paiement à la livraison",
        subtitle: "Payez en espèces à la réception",
      },
      {
        icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232046/oyamarket/icons/icon_garantie.png",
        title: "Garantie 30 jours",
        subtitle: "Satisfait ou remboursé",
      },
      {
        icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232047/oyamarket/icons/icon_support.png",
        title: "Service client 7j/7",
        subtitle: "Assistance réactive par email",
      },
    ],
    videos: [
      {
        videoUrl:
          "https://res.cloudinary.com/poqm6bs0/video/upload/v1789231353/oyamarket/products/aspirateur-points-noirs/ugc_video_1.mp4",
        poster:
          "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231347/oyamarket/products/aspirateur-points-noirs/ugc_poster_1.jpg",
        caption: "« Regardez tout ce qui est sorti en seulement 3 minutes ! »",
        stars: 5,
      },
      {
        videoUrl:
          "https://res.cloudinary.com/poqm6bs0/video/upload/v1789231394/oyamarket/products/aspirateur-points-noirs/ugc_video_2.mp4",
        poster:
          "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231371/oyamarket/products/aspirateur-points-noirs/ugc_poster_2.jpg",
        caption: "« Plus besoin de presser mon nez avec les ongles, incroyable. »",
        stars: 5,
      },
      {
        videoUrl:
          "https://res.cloudinary.com/poqm6bs0/video/upload/v1789231429/oyamarket/products/aspirateur-points-noirs/ugc_video_3.mp4",
        poster:
          "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231422/oyamarket/products/aspirateur-points-noirs/ugc_poster_3.jpg",
        caption: "« Reçu à Cotonou en 24h, colis super bien emballé. »",
        stars: 5,
      },
    ],
    steps: [
      {
        num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232038/oyamarket/icons/step_num_1.png",
        title: "Préparez votre peau",
        desc: "Nettoyez votre visage et appliquez une serviette tiède 3 minutes pour ouvrir les pores.",
      },
      {
        num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232039/oyamarket/icons/step_num_2.png",
        title: "Choisissez l'embout",
        desc: "Sélectionnez l'embout adapté (nez, joues ou menton) et allumez l'appareil au niveau 1.",
      },
      {
        num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232040/oyamarket/icons/step_num_3.png",
        title: "Glissez doucement",
        desc: "Faites glisser délicatement l'embout sur la zone ciblée sans rester plus de 2 secondes au même endroit.",
      },
      {
        num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232041/oyamarket/icons/step_num_4.png",
        title: "Rincez et admirez",
        desc: "Rincez votre visage à l'eau fraîche pour resserrer les pores et appliquez votre sérum ou crème.",
      },
    ],
    beforeAfter: {
      badge: "Résultats Visibles",
      title: "Dites adieu aux points noirs tenaces",
      description:
        "Contrairement aux patchs agressifs ou au pressage manuel qui abîme les capillaires sanguins, notre technologie d'aspiration douce par dépression d'air purifie vos pores en profondeur sans douleur.",
      image: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231166/oyamarket/products/aspirateur-points-noirs/avant_apres.jpg",
      benefits: [
        {
          title: "Élimine comédons & sébum incrusté",
          desc: "Déloge les impuretés les plus profondes dès le premier passage.",
        },
        {
          title: "Resserre visiblement les pores",
          desc: "Empêche l'accumulation de nouvelles impuretés au fil des utilisations.",
        },
        {
          title: "Peau lisse et nette sans rougeurs",
          desc: "Technologie adaptée à tous types de peaux, même sensibles.",
        },
      ],
    },
    benefitCards: [
      {
        title: "Une peau nette en 5 minutes",
        desc: "Nettoyage rapide et efficace chez vous, sans frais réguliers en institut de beauté.",
      },
      {
        title: "5 embouts pour chaque zone",
        desc: "Embouts spécifiques pour les ailes du nez, le menton, le front et les zones délicates.",
      },
      {
        title: "Rechargeable par USB",
        desc: "Batterie longue durée offrant jusqu'à 3 semaines d'autonomie par charge.",
      },
    ],
    reviews: [
      {
        name: "Grâce D.",
        city: "Cotonou",
        avatar: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231193/oyamarket/products/aspirateur-points-noirs/avatar_grace.jpg",
        badge: "Achat vérifié",
        stars: 5,
        text: "Moi c'était surtout la graisse sur le nez qui me dérangeait. J'ai commencé doucement au niveau 1 et franchement j'aime beaucoup. Après utilisation mon nez paraît beaucoup plus propre.",
      },
      {
        name: "Christelle A.",
        city: "Porto-Novo",
        avatar: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231202/oyamarket/products/aspirateur-points-noirs/avatar_christelle.jpg",
        badge: "Achat vérifié",
        stars: 5,
        text: "J'avais beaucoup de petits points noirs autour du nez. Ce que j'aime c'est qu'on peut régler la puissance. Je ne presse presque plus mon nez avec les doigts comme avant.",
      },
      {
        name: "Junior M.",
        city: "Abomey-Calavi",
        avatar: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231213/oyamarket/products/aspirateur-points-noirs/avatar_junior.jpg",
        badge: "Achat vérifié",
        stars: 5,
        text: "Je pensais que c'était seulement pour les femmes. Mon front et mon nez graissent beaucoup. Je l'utilise surtout sur le nez et j'aime bien le résultat. Très simple à utiliser.",
      },
      {
        name: "Prisca K.",
        city: "Parakou",
        avatar: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231228/oyamarket/products/aspirateur-points-noirs/avatar_prisca.jpg",
        badge: "Achat vérifié",
        stars: 5,
        text: "Je conseille juste de commencer avec la petite puissance. La première fois j'avais peur que ça fasse mal mais ça va. J'aime surtout l'utiliser autour du nez.",
      },
    ],
    clientPhotos: [
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789233585/oyamarket/products/aspirateur-points-noirs/ugc_client_4.png",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789233571/oyamarket/products/aspirateur-points-noirs/ugc_client_2.png",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789233580/oyamarket/products/aspirateur-points-noirs/ugc_client_3.png",
      "https://res.cloudinary.com/poqm6bs0/image/upload/v1789233562/oyamarket/products/aspirateur-points-noirs/ugc_client_1.png",
    ],
    unboxing: {
      image: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231185/oyamarket/products/aspirateur-points-noirs/unboxing_coffret.jpg",
      title: "Ce que contient exactement votre coffret :",
      items: [
        "1x Appareil aspirateur rechargeable haute performance",
        "5x Embouts amovibles ergonomiques (différentes tailles & formes)",
        "1x Kit complet de 4 extracteurs comédons en acier chirurgical inoxydable",
        "1x Câble de recharge USB universel",
        "1x Sachet de filtres éponges de rechange",
        "1x Manuel d'utilisation détaillé en français",
      ],
      ctaText: "Commander mon coffret maintenant",
    },
    accordions: [
      {
        title: "Description détaillée du produit",
        content:
          "L'aspirateur de points noirs OyaMarket utilise une technologie de micro-aspiration par le vide pour désincruster les pores en profondeur. Il retire efficacement l'excès de sébum, les comédons et cellules mortes sans irriter l'épiderme.",
        defaultOpen: true,
      },
      {
        title: "Compositions & Spécifications techniques",
        content:
          "Appareil en ABS hypoallergénique de qualité médicale. 3 modes d'aspiration (Peau sèche, normale, grasse). Batterie lithium-ion rechargeable via USB 5V. 5 embouts en silicone et plastique médical.",
        defaultOpen: false,
      },
      {
        title: "Conseils d'utilisation & Précautions",
        content:
          "Toujours ouvrir les pores avant utilisation à l'aide d'une compresse ou serviette chaude. Ne pas maintenir l'appareil immobile sur un point précis plus de 2 secondes. Utiliser 1 à 2 fois par semaine maximum.",
        defaultOpen: false,
      },
    ],
    faq: [
      {
        q: "Est-ce qu'il enlève vraiment la graisse et les points noirs ?",
        a: "Oui, la puissance d'aspiration par le vide extrait efficacement l'excès de sébum incrusté, les comédons et les impuretés superficielles logées au fond des pores. Votre peau est immédiatement plus nette et lisse au toucher.",
      },
      {
        q: "Comment se passent la livraison et le paiement ?",
        a: "La livraison est 100% gratuite partout au Bénin (Cotonou, Calavi, Porto-Novo, Parakou, etc.). Le paiement s'effectue en espèces directement au livreur après réception de votre colis. Zéro risque pour vous.",
      },
      {
        q: "Quel est le délai de livraison ?",
        a: "Les commandes sont expédiées sous 24h. Vous recevez votre colis sous 24h à 48h selon votre ville. Notre service client confirme votre commande dès sa validation.",
      },
      {
        q: "Que contient exactement le coffret ?",
        a: "Vous recevez l'appareil aspirateur rechargeable, 5 embouts ergonomiques, 1 kit de 4 extracteurs de comédons en inox, un câble de recharge USB, un sachet de filtres de rechange et le manuel d'utilisation complet en français.",
      },
      {
        q: "Est-ce douloureux ou laisse-t-il des traces ?",
        a: "Non, s'il est utilisé conformément aux instructions en glissant continuellement sans faire du surplace, le traitement est indolore. Une légère rougeur passagère peut apparaître due à l'activation sanguine et disparaît en 15 minutes.",
      },
    ],
  };

  const product1 = await prisma.product.create({
    data: {
      storeId: store.id,
      name: "Aspirateur Points Noirs 3-en-1 Pro",
      slug: "aspirateur-points-noirs",
      category: "Beauté & Soins",
      price: 15000,
      compareAtPrice: 25000,
      costPrice: 6500,
      stock: 200,
      isActive: true,
      imageUrl: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789231145/oyamarket/products/aspirateur-points-noirs/hero.jpg",
      landingData: aspirateurLandingData,
    },
  });

  const pack1_p1 = await prisma.productPack.create({
    data: {
      productId: product1.id,
      name: "1x Aspirateur Points Noirs",
      subtitle: "Kit complet avec 5 embouts",
      quantity: 1,
      price: 15000,
      compareAtPrice: 25000,
      isPopular: false,
      position: 0,
    },
  });

  const pack2_p1 = await prisma.productPack.create({
    data: {
      productId: product1.id,
      name: "2x Aspirateurs Points Noirs",
      subtitle: "Offrez-en un à un proche (-5 000 FCFA)",
      badge: "Plus Populaire 🔥",
      quantity: 2,
      price: 25000,
      compareAtPrice: 45000,
      isPopular: true,
      position: 1,
    },
  });
  console.log("✅ Produit 1 créé (avec 2 packs relationnels) :", product1.name);

  // 4. Produits secondaires pour le catalogue
  const product2 = await prisma.product.create({
    data: {
      storeId: store.id,
      name: "Kit Blanchiment Dentaire LED",
      slug: "kit-blanchiment",
      category: "Hygiène",
      price: 20000,
      compareAtPrice: 35000,
      costPrice: 8500,
      stock: 120,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop",
    },
  });
  await prisma.productPack.createMany({
    data: [
      {
        productId: product2.id,
        name: "1x Kit Blanchiment Dentaire",
        subtitle: "Gouttière LED + 3 seringues de gel",
        quantity: 1,
        price: 20000,
        compareAtPrice: 35000,
        isPopular: false,
        position: 0,
      },
      {
        productId: product2.id,
        name: "2x Kits Blanchiment (Duo Sourire)",
        subtitle: "Traitement complet pour couple",
        badge: "Économisez 5 000 FCFA",
        quantity: 2,
        price: 35000,
        compareAtPrice: 60000,
        isPopular: true,
        position: 1,
      },
    ],
  });

  const product3 = await prisma.product.create({
    data: {
      storeId: store.id,
      name: "Coussin Ergonomique 7-en-1",
      slug: "coussin-ergonomique",
      category: "Bien-être",
      price: 18000,
      compareAtPrice: 30000,
      costPrice: 7500,
      stock: 85,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=1000&auto=format&fit=crop",
    },
  });
  await prisma.productPack.createMany({
    data: [
      {
        productId: product3.id,
        name: "1x Coussin Ergonomique",
        subtitle: "Mousse à mémoire de forme haute densité",
        quantity: 1,
        price: 18000,
        compareAtPrice: 30000,
        isPopular: false,
        position: 0,
      },
      {
        productId: product3.id,
        name: "2x Coussins Ergonomiques (Duo Sommeil)",
        subtitle: "Pour vous et votre partenaire",
        badge: "Pack Recommandé",
        quantity: 2,
        price: 30000,
        compareAtPrice: 50000,
        isPopular: true,
        position: 1,
      },
    ],
  });

  const product4 = await prisma.product.create({
    data: {
      storeId: store.id,
      name: "Masseur Cervical Intelligent",
      slug: "masseur-cervical",
      category: "Santé",
      price: 12000,
      compareAtPrice: 22000,
      costPrice: 5000,
      stock: 60,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
    },
  });
  await prisma.productPack.createMany({
    data: [
      {
        productId: product4.id,
        name: "1x Masseur Cervical",
        subtitle: "Électrostimulation TENS + Chaleur douce",
        quantity: 1,
        price: 12000,
        compareAtPrice: 22000,
        isPopular: false,
        position: 0,
      },
      {
        productId: product4.id,
        name: "2x Masseurs Cervicaux",
        subtitle: "Idéal pour soulager toute la famille",
        badge: "Offre Spéciale",
        quantity: 2,
        price: 20000,
        compareAtPrice: 38000,
        isPopular: true,
        position: 1,
      },
    ],
  });
  console.log("✅ Produits secondaires créés avec packs :", product2.name, ",", product3.name, ",", product4.name);

  // 5. Importation automatique des fiches produits CRO depuis data/products/ (Bouchon vin, Ceinture EMS, Filtre eau, Caméra A9...)
  const productsDir = path.join(__dirname, "../data/products");
  const loadedProducts = {};
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(productsDir, file), "utf-8");
        const { product: prodData, landingData } = JSON.parse(raw);

        const createdProduct = await prisma.product.create({
          data: {
            storeId: store.id,
            name: prodData.name,
            slug: prodData.slug,
            category: prodData.category,
            price: prodData.price,
            compareAtPrice: prodData.compareAtPrice,
            costPrice: prodData.costPrice,
            stock: prodData.stock,
            isActive: true,
            imageUrl: prodData.imageUrl,
            isFeatured: prodData.isFeatured ?? false,
            featuredOrder: prodData.featuredOrder ?? 0,
            landingData: landingData,
          },
        });

        const createdPacks = [];
        if (Array.isArray(prodData.packs)) {
          for (const pack of prodData.packs) {
            const p = await prisma.productPack.create({
              data: {
                productId: createdProduct.id,
                name: pack.name,
                subtitle: pack.subtitle,
                badge: pack.badge,
                quantity: pack.quantity,
                price: pack.price,
                compareAtPrice: pack.compareAtPrice,
                isPopular: pack.isPopular ?? false,
                position: pack.position ?? 0,
              },
            });
            createdPacks.push(p);
          }
        }
        loadedProducts[prodData.slug] = { product: createdProduct, packs: createdPacks };
        console.log(`✅ Fiche CRO importée (${file}) : ${createdProduct.name} avec ${createdPacks.length} packs`);
      } catch (err) {
        console.error(`❌ Erreur importation ${file} :`, err.message);
      }
    }
  }

  // 6. Commandes COD de Test (Pipeline réaliste au Bénin)
  const ordersData = [
    {
      customerName: "Sèna Houessou",
      customerPhone: "+229 97 12 34 56",
      customerCity: "Cotonou",
      quartier: "Fidjrossè Calvaire",
      notes: "Livrer de préférence après 16h",
      status: "NEW",
      productId: product1.id,
      packId: pack1_p1.id,
      packName: pack1_p1.name,
      quantity: 1,
      unitsCount: 1,
      unitPrice: 15000,
      totalPrice: 15000,
      totalAmount: 15000,
    },
    {
      customerName: "Mireille Dossou",
      customerPhone: "+229 95 88 77 66",
      customerCity: "Porto-Novo",
      quartier: "Ouando, carrefour cinquantenaire",
      notes: "Appeler avant de venir",
      status: "PENDING_CONFIRMATION",
      productId: product1.id,
      packId: pack2_p1.id,
      packName: pack2_p1.name,
      quantity: 1,
      unitsCount: 2,
      unitPrice: 25000,
      totalPrice: 25000,
      totalAmount: 25000,
    },
    {
      customerName: "Christian Agbodjan",
      customerPhone: "+229 66 43 21 00",
      customerCity: "Abomey-Calavi",
      quartier: "Zogbadjè près du campus",
      notes: "Maison portail bleu",
      status: "CONFIRMED",
      productId: product1.id,
      packId: pack1_p1.id,
      packName: pack1_p1.name,
      quantity: 1,
      unitsCount: 1,
      unitPrice: 15000,
      totalPrice: 15000,
      totalAmount: 15000,
    },
    {
      customerName: "Fatou Bio",
      customerPhone: "+229 94 50 60 70",
      customerCity: "Parakou",
      quartier: "Albarika, rue de l'hôpital",
      notes: null,
      status: "SHIPPED",
      productId: product1.id,
      packId: pack2_p1.id,
      packName: pack2_p1.name,
      quantity: 1,
      unitsCount: 2,
      unitPrice: 25000,
      totalPrice: 25000,
      totalAmount: 25000,
    },
    {
      customerName: "Arnaud Kpadonou",
      customerPhone: "+229 97 99 88 11",
      customerCity: "Cotonou",
      quartier: "Akpakpa Dodomè",
      notes: "Paiement en espèces prévu",
      status: "DELIVERED",
      productId: product1.id,
      packId: pack1_p1.id,
      packName: pack1_p1.name,
      quantity: 1,
      unitsCount: 1,
      unitPrice: 15000,
      totalPrice: 15000,
      totalAmount: 15000,
    },
  ];

  // Commandes pour les nouveaux produits importés
  if (loadedProducts["bouchon-vide-air-vin-dateur"] && loadedProducts["bouchon-vide-air-vin-dateur"].packs.length > 0) {
    const vinProd = loadedProducts["bouchon-vide-air-vin-dateur"].product;
    const vinPack = loadedProducts["bouchon-vide-air-vin-dateur"].packs[1] || loadedProducts["bouchon-vide-air-vin-dateur"].packs[0];
    ordersData.push({
      customerName: "Armand Dossou",
      customerPhone: "+229 96 11 22 33",
      customerCity: "Cotonou",
      quartier: "Haie Vive",
      notes: "Appeler avant de livrer au bureau",
      status: "CONFIRMED",
      productId: vinProd.id,
      packId: vinPack.id,
      packName: vinPack.name,
      quantity: 1,
      unitsCount: vinPack.quantity,
      unitPrice: vinPack.price,
      totalPrice: vinPack.price,
      totalAmount: vinPack.price,
    });
  }

  if (loadedProducts["ceinture-abdominale-ems-pro"] && loadedProducts["ceinture-abdominale-ems-pro"].packs.length > 0) {
    const emsProd = loadedProducts["ceinture-abdominale-ems-pro"].product;
    const emsPack = loadedProducts["ceinture-abdominale-ems-pro"].packs[0];
    ordersData.push({
      customerName: "Clarisse Agbodjan",
      customerPhone: "+229 67 89 01 23",
      customerCity: "Abomey-Calavi",
      quartier: "Arconville",
      notes: "Paiement par MoMo à la livraison",
      status: "SHIPPED",
      productId: emsProd.id,
      packId: emsPack.id,
      packName: emsPack.name,
      quantity: 1,
      unitsCount: emsPack.quantity,
      unitPrice: emsPack.price,
      totalPrice: emsPack.price,
      totalAmount: emsPack.price,
    });
  }

  for (const o of ordersData) {
    await prisma.order.create({
      data: {
        storeId: store.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerCity: o.customerCity,
        quartier: o.quartier,
        notes: o.notes,
        status: o.status,
        totalAmount: o.totalAmount,
        items: {
          create: {
            productId: o.productId,
            packId: o.packId,
            packName: o.packName,
            quantity: o.quantity,
            unitsCount: o.unitsCount,
            unitPrice: o.unitPrice,
            totalPrice: o.totalPrice,
            price: o.unitPrice,
          },
        },
      },
    });
  }
  console.log(`✅ ${ordersData.length} commandes COD initiales créées avec succès !`);

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("ID de la Boutique :", store.id);
  console.log("Identifiants de connexion Dashboard : info@denemlabs.com / Oyamarket@2026");
}

main()
  .catch((e) => {
    console.error("❌ Erreur de seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
