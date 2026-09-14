import { getMedias } from "@/lib/actions/media";
import { getCurrentMemberContext } from "@/lib/actions/store-context";
import { redirect } from "next/navigation";
import { MediaGallery } from "@/components/media/media-gallery";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  let context;
  try {
    context = await getCurrentMemberContext();
  } catch {
    context = null;
  }

  if (context?.role === "DELIVERY") {
    redirect("/orders");
  }

  const medias = await getMedias();

  return <MediaGallery initialMedias={medias} />;
}
