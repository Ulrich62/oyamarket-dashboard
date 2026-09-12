import { getMedias } from "@/lib/actions/media";
import { MediaGallery } from "@/components/media/media-gallery";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const medias = await getMedias();

  return <MediaGallery initialMedias={medias} />;
}
