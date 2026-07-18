"use client";

import { useState } from "react";
import { ImageIcon, Maximize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fileUrl } from "@/lib/files";

export function StoreProductImageDialog({
  imageUrl,
  imageUrls,
  title,
}: {
  imageUrl: string | null;
  imageUrls?: string[];
  title: string;
}) {
  const images = (imageUrls && imageUrls.length > 0 ? imageUrls : [imageUrl])
    .map((value) => fileUrl(value))
    .filter((value): value is string => Boolean(value));
  const src = images[0] ?? null;
  const [selectedImage, setSelectedImage] = useState(src);

  if (!src) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-[var(--subtle)]">
        <ImageIcon className="size-12 text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger className="group relative block aspect-[16/10] w-full overflow-hidden bg-[var(--subtle)] text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={src}
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#061e35]/42 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        {images.length > 1 ? (
          <span className="absolute bottom-3 left-3 flex gap-2">
            {images.slice(0, 2).map((image, index) => (
              <span
                className="block size-12 overflow-hidden rounded-lg border-2 border-white bg-white shadow-lg"
                key={image}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${title} miniature ${index + 1}`}
                  className="h-full w-full object-cover"
                  src={image}
                />
              </span>
            ))}
          </span>
        ) : null}
        <span className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-white/92 text-[var(--primary)] shadow-lg opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="size-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-[var(--border)] p-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Apercu du produit</DialogDescription>
        </DialogHeader>
        <div className="bg-[#061e35] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={title}
            className="max-h-[76vh] w-full rounded-lg object-contain"
            src={selectedImage ?? src}
          />
          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {images.map((image, index) => (
                <button
                  className="overflow-hidden rounded-lg border border-white/12 bg-white/8 p-0 transition hover:border-white/70 data-[active=true]:border-[var(--gold)]"
                  data-active={image === (selectedImage ?? src)}
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  type="button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${title} ${index + 1}`}
                    className="aspect-square w-full object-cover"
                    src={image}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
