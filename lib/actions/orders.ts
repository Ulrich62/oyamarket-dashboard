"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requireStoreId(): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const user = session.user;

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    select: { storeId: true },
  });
  if (!member) throw new Error("Aucune boutique trouvée");
  return member.storeId;
}

// ─── Schemas ────────────────────────────────────────────────────────────────

const OrderSchema = z.object({
  customerName: z.string().min(1, "Le nom du client est requis"),
  customerPhone: z.string().min(1, "Le téléphone est requis"),
  quartier: z.string().optional().nullable(),
  status: z.nativeEnum(OrderStatus).default("NEW"),
  assignedToId: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.coerce.number().int().positive(),
      price: z.coerce.number().int().nonnegative(),
    })
  ).min(1, "La commande doit contenir au moins un produit"),
});

// ─── Server Actions — Orders ─────────────────────────────────────────────────

export async function getOrders(filters?: {
  status?: OrderStatus;
  assignedToId?: string;
}) {
  const storeId = await requireStoreId();
  return prisma.order.findMany({
    where: {
      storeId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.assignedToId && { assignedToId: filters.assignedToId }),
    },
    include: {
      items: {
        include: { product: { select: { name: true, imageUrl: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(id: string) {
  const storeId = await requireStoreId();
  return prisma.order.findFirst({
    where: { id, storeId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  quartier?: string;
  items: { productId: string; quantity: number; price: number }[];
}) {
  const storeId = await requireStoreId();
  
  const parsed = OrderSchema.safeParse({ ...data, status: "NEW" });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      storeId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      quartier: data.quartier,
      totalAmount,
      status: "NEW",
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });

  revalidatePath("/orders");
  return { success: true, order };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const storeId = await requireStoreId();
  
  const order = await prisma.order.update({
    where: { id, storeId },
    data: { status },
  });
  
  // 🔥 Déclenchement automatique Meta CAPI Purchase si commande livrée
  if (status === "DELIVERED") {
    const { sendMetaCapiPurchase } = await import("./meta-capi");
    const capiResult = await sendMetaCapiPurchase(id);
    if ("error" in capiResult) {
      console.warn("[META CAPI] Non-bloquant:", capiResult.error);
    } else {
      console.log("[META CAPI] Purchase envoyé:", capiResult.eventId);
    }
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { success: true, order };
}


export async function updateOrder(
  id: string,
  data: Partial<{
    customerName: string;
    customerPhone: string;
    quartier: string;
    status: OrderStatus;
    assignedToId: string | null;
    items: { productId: string; quantity: number; price: number }[];
  }>
) {
  const storeId = await requireStoreId();

  // Si on met à jour les items, on les recrée entièrement
  if (data.items) {
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const order = await prisma.order.update({
      where: { id, storeId },
      data: {
        ...(data.customerName && { customerName: data.customerName }),
        ...(data.customerPhone && { customerPhone: data.customerPhone }),
        ...(data.quartier !== undefined && { quartier: data.quartier }),
        ...(data.status && { status: data.status }),
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    return { success: true, order };
  }

  const order = await prisma.order.update({
    where: { id, storeId },
    data: {
      ...(data.customerName && { customerName: data.customerName }),
      ...(data.customerPhone && { customerPhone: data.customerPhone }),
      ...(data.quartier !== undefined && { quartier: data.quartier }),
      ...(data.status && { status: data.status }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { success: true, order };
}

export async function deleteOrder(id: string) {
  const storeId = await requireStoreId();
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id, storeId } });
  revalidatePath("/orders");
  return { success: true };
}
