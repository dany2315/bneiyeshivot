import {
  createHomeGalleryAlbum,
  deleteHomeGalleryAlbum,
  updateHomeGalleryAlbum,
} from "@/app/admin/actions";
import {
  AdminHomeGalleryClient,
  type AdminGalleryAlbum,
} from "@/components/admin-home-gallery-client";
import { AdminShell } from "@/components/admin-sidebar";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export const metadata = {
  title: "Admin galerie",
};

export default async function AdminGalleryPage() {
  await requireAdminUser();

  const albums = await prisma.homeGalleryAlbum.findMany({
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  }).catch(() => []);

  return (
    <AdminShell>
      <AdminHomeGalleryClient
        albums={
          albums.map((album) => ({
            id: album.id,
            title: album.title,
            description: album.description,
            active: album.active,
            sortOrder: album.sortOrder,
            items: album.items.map((item) => ({
              id: item.id,
              type: item.type,
              title: item.title,
              description: item.description,
              key: item.key,
              url: item.url,
              mimeType: item.mimeType,
            })),
          })) satisfies AdminGalleryAlbum[]
        }
        createAction={createHomeGalleryAlbum}
        deleteAction={deleteHomeGalleryAlbum}
        updateAction={updateHomeGalleryAlbum}
      />
    </AdminShell>
  );
}
