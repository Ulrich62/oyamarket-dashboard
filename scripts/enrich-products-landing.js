const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const STORE_ID = "cmtxoxqor000112jrigl2lu6w";

const sharedTrustBadges = [
  {
    icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232043/oyamarket/icons/icon_livraison.png",
    title: "Livraison gratuite",
    subtitle: "Partout au Bénin (24-48h)",
  },
  {
    icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232045/oyamarket/icons/icon_paiement.png",
    title: "Paiement à la livraison",
    subtitle: "Espèces à la réception",
  },
  {
    icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232046/oyamarket/icons/icon_garantie.png",
    title: "Garantie 30 jours",
    subtitle: "Satisfait ou échangé",
  },
  {
    icon: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232047/oyamarket/icons/icon_support.png",
    title: "Service client 7j/7",
    subtitle: "Assistance réactive par email",
  },
];

const sharedShippingRibbon = [
  "🚚 Livraison Express Gratuite au Bénin",
  "💵 Paiement à la réception",
  "🛡️ Garantie 30 Jours",
  "✨ Service Client Dédié 7j/7",
];

const masseurLandingData = {
  heroImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
  headline: "Masseur Cervical Intelligent TENS™ – Soulagement Instantané des Douleurs & Tensions",
  rating: 4.9,
  reviewsCount: 842,
  keyArguments: [
    "Électrostimulation TENS & Chaleur Douce 42°C apaisante",
    "6 modes de massage & 15 niveaux d'intensité personnalisables",
    "Ergonomique en U, ultra-léger et rechargeable par USB",
  ],
  stockBadge: "En stock • Expédition rapide en 24h à 48h partout au Bénin",
  shippingRibbon: sharedShippingRibbon,
  trustBadges: sharedTrustBadges,
  gallery: [
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
  ],
  twoStepsTitle: "Dites adieu aux raideurs de la nuque en 15 minutes par jour",
  twoStepsDesc: "Idéal après de longues heures sur ordinateur, au volant ou en cas de stress chronique. La combinaison des micro-courants TENS et de la diffusion thermique dénoue les contractures musculaires profondes.",
  twoStepsBullets: [
    "Détente musculaire ciblée des trapèzes et cervicales",
    "Améliore la circulation sanguine locale grâce à la chaleur 42°C",
    "Utilisable partout : au bureau, à la maison ou en voyage",
  ],
  beforeAfterImage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1000&auto=format&fit=crop",
  threeInOneCards: [
    {
      title: "Soulagement TENS & EMS",
      desc: "Micro-impulsions douces qui stimulent les fibres musculaires pour bloquer les signaux de douleur.",
    },
    {
      title: "Chaleur Constante 42°C",
      desc: "Diffusion thermique enveloppante qui détend immédiatement les muscles endoloris et stressés.",
    },
    {
      title: "Sans fil & Rechargeable USB",
      desc: "Batterie lithium haute capacité offrant jusqu'à 8 jours d'utilisation quotidienne par charge.",
    },
  ],
  steps: [
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232038/oyamarket/icons/step_num_1.png",
      title: "Humidifiez la nuque",
      desc: "Passez un tissu légèrement humide ou appliquez une goutte de crème pour favoriser la conduction.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232039/oyamarket/icons/step_num_2.png",
      title: "Positionnez l'appareil",
      desc: "Placez le collier ergonomique autour de votre cou. Les électrodes s'ajustent naturellement à vos courbes.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232040/oyamarket/icons/step_num_3.png",
      title: "Allumez et réglez",
      desc: "Sélectionnez votre mode favori (pétrissage, shiatsu, acupuncture) et réglez l'intensité désirée.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232041/oyamarket/icons/step_num_4.png",
      title: "Détendez-vous",
      desc: "Profitez de votre séance de 15 minutes. L'appareil s'éteint automatiquement une fois le cycle terminé.",
    },
  ],
  reviews: [
    {
      name: "Aimé K.",
      city: "Cotonou",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Après 8 heures quotidiennes sur mon PC, mes cervicales étaient complètement bloquées. Cet appareil m'a soulagé dès la première utilisation le soir. Livraison express reçue le lendemain !",
    },
    {
      name: "Clarisse B.",
      city: "Porto-Novo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "La chaleur douce est un vrai bonheur en rentrant du travail. Très simple d'utilisation et la batterie tient très bien.",
    },
    {
      name: "Boris M.",
      city: "Abomey-Calavi",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Produit de grande qualité. Le livreur est venu jusqu'à mon domicile à Calavi et j'ai payé après vérification. Bravo à l'équipe OyaMarket !",
    },
  ],
  clientPhotos: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
  ],
  unboxingImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
  unboxingItems: [
    "1x Masseur Cervical Intelligent TENS ergonomique",
    "1x Câble de recharge rapide USB",
    "2x Électrodes d'appoint pour les trapèzes ou le bas du dos",
    "1x Manuel d'utilisation complet en français",
  ],
  accordions: [
    {
      title: "Description & Bienfaits",
      content: "Le Masseur Cervical Intelligent utilise l'électrostimulation neuromusculaire basse fréquence (TENS) associée à un rayonnement thermique infrarouge lointain pour détendre les muscles contractés du cou et des épaules en quelques minutes.",
    },
    {
      title: "Spécifications Techniques",
      content: "Poids : 160g ultra-léger\nMatériau : Silicone doux médical et acier inoxydable 304\nAlimentation : Batterie Lithium 1200mAh rechargeable USB\nModes : 6 modes programmés\nNiveaux : 15 intensités réglables\nArrêt automatique : Minuteur 15 minutes",
    },
    {
      title: "Conseils d'Utilisation",
      content: "Appliquez sur une peau propre. Démarrez toujours à l'intensité 1 puis montez graduellement selon votre sensibilité. Une séance quotidienne de 15 minutes suffit pour ressentir un soulagement durable.",
    },
  ],
  faq: [
    {
      q: "Est-ce douloureux ?",
      a: "Absolument pas ! Les impulsions TENS procurent une sensation de picotement et de tapotement relaxante. Vous contrôlez l'intensité de 1 à 15 selon votre confort.",
    },
    {
      q: "Combien de temps dure la batterie ?",
      a: "Une seule charge de 2h offre environ 8 à 10 jours d'utilisation à raison d'une séance de 15 minutes par jour.",
    },
    {
      q: "Comment fonctionne la livraison et le paiement ?",
      a: "La livraison est 100% gratuite dans tout le Bénin. Vous payez en espèces directement au livreur une fois le colis en main.",
    },
  ],
};

const coussinLandingData = {
  heroImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=1000&auto=format&fit=crop",
  headline: "Coussin Ergonomique 7-en-1 à Mémoire de Forme™ – Alignement Parfait & Sommeil Réparateur",
  rating: 4.9,
  reviewsCount: 658,
  keyArguments: [
    "Mousse viscoélastique haute densité à mémoire de forme 50D",
    "Conception ergonomique 7-en-1 : maintien nuque, cou et colonne",
    "Housse respirante hypoallergénique et lavable en machine",
  ],
  stockBadge: "En stock • Expédition rapide en 24h à 48h partout au Bénin",
  shippingRibbon: sharedShippingRibbon,
  trustBadges: sharedTrustBadges,
  gallery: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=1000&auto=format&fit=crop",
  ],
  twoStepsTitle: "Réveillez-vous enfin sans torticolis ni mal de dos",
  twoStepsDesc: "Conçu avec des ostéopathes pour épouser naturellement la courbe cervicale. Il maintient votre tête et votre colonne vertébrale dans un alignement parfait tout au long de la nuit.",
  twoStepsBullets: [
    "Soulage les pressions sur les disques vertébraux",
    "Favorise une meilleure respiration et réduit les ronflements",
    "Double hauteur adaptée pour dormir sur le dos ou sur le côté",
  ],
  beforeAfterImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop",
  threeInOneCards: [
    {
      title: "Mousse Mémoire 50D",
      desc: "Mousse haute densité thermosensible qui absorbe les points de pression sans jamais s'affaisser.",
    },
    {
      title: "Housse Bambou Respirante",
      desc: "Tissu anti-acarien, anti-bactérien et lavable en machine pour une fraîcheur saine toute l'année.",
    },
    {
      title: "Design Ergonomique Biseauté",
      desc: "Deux hauteurs de couchage (11 cm et 6 cm) pour satisfaire toutes les morphologies et positions.",
    },
  ],
  steps: [
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232038/oyamarket/icons/step_num_1.png",
      title: "Choisissez votre côté",
      desc: "Utilisez le côté surélevé (11cm) si vous dormez sur le côté, ou le côté plus doux (6cm) si vous dormez sur le dos.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232039/oyamarket/icons/step_num_2.png",
      title: "Laissez la mousse épouser votre nuque",
      desc: "En quelques secondes, la mousse thermosensible s'adapte à la chaleur de votre corps et allège les tensions.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232040/oyamarket/icons/step_num_3.png",
      title: "Profitez d'un sommeil profond",
      desc: "Votre colonne vertébrale reste droite, réduisant les micro-réveils nocturnes et les courbatures matinales.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232041/oyamarket/icons/step_num_4.png",
      title: "Entretien facile",
      desc: "Dézippez simplement la housse de protection et lavez-la en machine à 30°C.",
    },
  ],
  reviews: [
    {
      name: "Sylvie D.",
      city: "Cotonou",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Depuis que j'utilise ce coussin, mes douleurs cervicales au réveil ont complètement disparu. C'est un vrai bonheur pour mes nuits !",
    },
    {
      name: "Hubert A.",
      city: "Parakou",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Le coussin est très ferme et garde bien sa forme. La livraison à Parakou s'est faite en 48h comme promis.",
    },
    {
      name: "Félicité Z.",
      city: "Porto-Novo",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "J'ai pris le pack duo pour mon mari et moi. Nous dormons tellement mieux ! La housse est douce et facile à laver.",
    },
  ],
  clientPhotos: [
    "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop",
  ],
  unboxingImage: "https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=1000&auto=format&fit=crop",
  unboxingItems: [
    "1x Coussin Ergonomique à Mémoire de Forme Haute Densité",
    "1x Housse zippée hypoallergénique et lavable",
    "1x Sac de transport protecteur hermétique",
    "1x Fiche conseils sommeil et entretien",
  ],
  accordions: [
    {
      title: "Description & Avantages Ostéopathiques",
      content: "Ce coussin ergonomique est spécialement étudié pour respecter la cambrure naturelle des vertèbres cervicales (lordose physiologique). Il réduit la compression nerveuse et musculaire responsable des maux de tête et torticolis matinaux.",
    },
    {
      title: "Dimensions & Matériaux",
      content: "Dimensions : 60 cm (L) x 35 cm (l) x 11 cm / 6 cm (H)\nCœur : Mousse viscoélastique à mémoire de forme 50D thermo-régulatrice\nHousse : Tissu microfibre bambou respirant ultra-doux avec fermeture éclair sécurisée",
    },
    {
      title: "Entretien & Lavage",
      content: "La housse zippée se retire en quelques secondes et se lave en machine à 30°C. La mousse intérieure ne doit pas être lavée en machine ; un simple dépoussiérage ou aération suffit.",
    },
  ],
  faq: [
    {
      q: "Le coussin s'affaisse-t-il avec le temps ?",
      a: "Non, notre mousse à mémoire de forme haute densité reprend sa forme instantanément dès que vous vous levez et conserve son élasticité durant de nombreuses années.",
    },
    {
      q: "Convient-il pour dormir sur le ventre ?",
      a: "Il est principalement conçu pour les dormeurs sur le côté et sur le dos, qui représentent 85% des personnes. Pour dormir sur le dos ou le côté, le maintien est incomparable.",
    },
    {
      q: "La livraison est-elle payante ?",
      a: "La livraison est 100% gratuite partout au Bénin. Vous ne payez que le prix affiché à la réception de votre colis.",
    },
  ],
};

const blanchimentLandingData = {
  heroImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop",
  headline: "Kit de Blanchiment Dentaire LED Professionnel™ – Jusqu'à 8 Teintes Plus Blanc",
  rating: 4.9,
  reviewsCount: 915,
  keyArguments: [
    "Technologie LED à lumière froide activatrice de gel blancheur",
    "Formule sans peroxyde : 100% sans douleur ni sensibilité dentaire",
    "Résultats visibles dès les 3 premières séances de 16 minutes",
  ],
  stockBadge: "En stock • Expédition rapide en 24h à 48h partout au Bénin",
  shippingRibbon: sharedShippingRibbon,
  trustBadges: sharedTrustBadges,
  gallery: [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop",
  ],
  twoStepsTitle: "Retrouvez un sourire éclatant et lumineux depuis chez vous",
  twoStepsDesc: "Éliminez sans douleur les taches incrustées causées par le café, le thé, le tabac et les boissons colorées. Notre formule douce respecte l'émail et protège vos gencives.",
  twoStepsBullets: [
    "Gagnez jusqu'à 8 teintes de blancheur en 7 jours",
    "Aucune sensibilité dentaire : formule certifiée sans peroxyde",
    "Séance rapide de 16 minutes avec minuteur automatique intégré",
  ],
  beforeAfterImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1000&auto=format&fit=crop",
  threeInOneCards: [
    {
      title: "Lumière Bleue LED",
      desc: "5 diodes lumineuses à spectre froid qui activent instantanément les agents éclaircissants du gel.",
    },
    {
      title: "Formule Émail Protégé",
      desc: "Élimine les taches en surface et en profondeur sans altérer la barrière protectrice de la dent.",
    },
    {
      title: "Gouttière Silicone Médical",
      desc: "S'adapte confortablement à toutes les mâchoires sans nécessiter de moulage à l'eau chaude.",
    },
  ],
  steps: [
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232038/oyamarket/icons/step_num_1.png",
      title: "Brossez vos dents",
      desc: "Effectuez un brossage soigné avant la séance pour éliminer la plaque et les résidus.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232039/oyamarket/icons/step_num_2.png",
      title: "Appliquez le gel",
      desc: "Déposez un fin liseré de gel blanchissant sur la face supérieure et inférieure de la gouttière.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232040/oyamarket/icons/step_num_3.png",
      title: "Allumez la lampe LED",
      desc: "Insérez la gouttière en bouche, clipsez la lampe LED et allumez-la. Elle s'éteint seule après 16 min.",
    },
    {
      num: "https://res.cloudinary.com/poqm6bs0/image/upload/v1789232041/oyamarket/icons/step_num_4.png",
      title: "Rincez et admirez",
      desc: "Rincez votre bouche à l'eau tiède et observez votre sourire s'éclaircir de jour en jour sur le nuancier.",
    },
  ],
  reviews: [
    {
      name: "Grâce T.",
      city: "Cotonou",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Franchement bluffée ! En tant que grande buveuse de café, mes dents avaient jauni. Dès la 3ème séance, la différence était flagrante. Aucune douleur ni sensibilité.",
    },
    {
      name: "Arnaud G.",
      city: "Abomey-Calavi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Très simple à utiliser devant la télé le soir. Le colis a été livré le jour même à Calavi. Je recommande le pack duo pour les couples !",
    },
    {
      name: "Nadège H.",
      city: "Porto-Novo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      badge: "Achat vérifié",
      stars: 5,
      text: "Le résultat est digne des séances en institut qui coûtent une fortune. Mes dents sont éclatantes et le gel a un goût frais très agréable.",
    },
  ],
  clientPhotos: [
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop",
  ],
  unboxingImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop",
  unboxingItems: [
    "1x Émetteur LED lumière bleue à minuterie automatique 16 min",
    "1x Gouttière universelle confort en silicone médical",
    "3x Seringues de gel blanchissant actif haute concentration (10ml)",
    "1x Nuancier dentaire de suivi des résultats",
    "1x Manuel d'utilisation détaillé en français",
  ],
  accordions: [
    {
      title: "Description & Technologie Blancheur",
      content: "Le kit combine un gel actif à base de bicarbonate et de principes actifs éclaircissants doux avec une lumière LED froide haute intensité. La lumière accélère l'élimination des molécules colorées incrustées dans les porosités de l'émail.",
    },
    {
      title: "Composition & Sécurité Dentaire",
      content: "Formule conforme aux réglementations européennes, 100% sans peroxyde d'hydrogène. Ingrédients doux pour les gencives et protecteurs de la flore buccale. Silicone de gouttière sans BPA.",
    },
    {
      title: "Durée & Fréquence du Traitement",
      content: "Effectuez 1 séance de 16 minutes par jour pendant 7 à 10 jours consécutifs. Une fois le niveau de blancheur souhaité atteint, faites 1 séance d'entretien tous les 15 jours.",
    },
  ],
  faq: [
    {
      q: "Est-ce douloureux pour les dents sensibles ?",
      a: "Non, notre formule est garantie 100% sans peroxyde pour préserver totalement l'émail dentaire et éviter toute sensation d'élancement ou d'hypersensibilité.",
    },
    {
      q: "Combien de séances peut-on faire avec les 3 seringues ?",
      a: "Les 3 seringues fournies permettent de réaliser entre 15 et 20 séances complètes de blanchiment, soit plus qu'assez pour un traitement intensif et son entretien.",
    },
    {
      q: "Quel est le délai de livraison au Bénin ?",
      a: "Livraison rapide sous 24h à 48h partout au Bénin. Le livreur vous appelle avant son passage et vous réglez en espèces lors de la remise.",
    },
  ],
};

async function main() {
  console.log("Updating landingData for all products in store:", STORE_ID);

  // 1. Masseur cervical
  const pMasseur = await prisma.product.updateMany({
    where: { storeId: STORE_ID, slug: "masseur-cervical" },
    data: { landingData: masseurLandingData },
  });
  console.log("✅ Updated Masseur Cervical:", pMasseur.count);

  // 2. Coussin ergonomique
  const pCoussin = await prisma.product.updateMany({
    where: { storeId: STORE_ID, slug: "coussin-ergonomique" },
    data: { landingData: coussinLandingData },
  });
  console.log("✅ Updated Coussin Ergonomique:", pCoussin.count);

  // 3. Kit blanchiment
  const pBlanchiment = await prisma.product.updateMany({
    where: { storeId: STORE_ID, slug: "kit-blanchiment" },
    data: { landingData: blanchimentLandingData },
  });
  console.log("✅ Updated Kit Blanchiment:", pBlanchiment.count);

  console.log("🎉 All products now have rich bespoke landingData in database!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
