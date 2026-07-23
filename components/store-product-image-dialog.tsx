"use client";

import { useRef, useState } from "react";
import { ImageIcon, Images, Maximize2 } from "lucide-react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visiblePreviewImages = images.slice(0, 3);

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
          <>
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5">
              {visiblePreviewImages.map((image, index) => (
                <span
                  className="size-8 overflow-hidden rounded-md border border-white/70 bg-white shadow-sm"
                  key={image}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${title} ${index + 1}`}
                    className="h-full w-full object-cover"
                    src={image}
                  />
                </span>
              ))}
            </span>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-black text-[var(--primary)] shadow-sm">
              <Images className="size-3.5" />
              {images.length}
            </span>
          </>
        ) : null}
        <span className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-white/92 text-[var(--primary)] shadow-lg opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="size-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[min(96vw,1000px)] gap-0 overflow-hidden p-0 sm:max-w-none [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:top-4">
        <DialogHeader className="border-b border-[var(--border)] p-4 pb-3 pr-14 pt-5 sm:p-5 sm:pr-14">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Aperçu du produit</DialogDescription>
        </DialogHeader>
        <div className="grid h-[calc(80vh-85px)] min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-[#061e35]">
          <div className="grid min-h-0 overflow-hidden bg-[#061e35] p-2 sm:p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${title} ${selectedIndex + 1}`}
              className="m-auto max-h-full max-w-full object-contain"
              src={images[selectedIndex] ?? src}
            />
          </div>
          {images.length > 1 ? (
            <div className="flex max-w-full justify-center gap-2 overflow-x-auto border-t border-white/10 bg-[#061e35] p-2">
              {images.map((image, index) => (
                <button
                  className="size-12 shrink-0 overflow-hidden rounded-md border border-white/20 bg-white/8 p-0 transition hover:border-white/70 data-[active=true]:border-[var(--gold)] sm:size-14"
                  data-active={index === selectedIndex}
                  key={image}
                  onClick={() => {
                    setSelectedIndex(index);
                    thumbnailRefs.current[index]?.focus();
                  }}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type="button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${title} ${index + 1}`}
                    className="h-full w-full object-cover"
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
