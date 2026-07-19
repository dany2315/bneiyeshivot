"use client";

import { useRef, useState } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

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
        <span className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-white/92 text-[var(--primary)] shadow-lg opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="size-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-[var(--border)] p-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Apercu du produit</DialogDescription>
        </DialogHeader>
        <div className="relative bg-[#061e35] p-3">
          <div className="flex h-[min(70vh,620px)] snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-lg">
            {images.map((image, index) => (
              <div
                className="grid h-full min-w-full snap-center place-items-center bg-[#061e35]"
                key={image}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${title} ${index + 1}`}
                  className="max-h-full max-w-full object-contain"
                  src={image}
                />
              </div>
            ))}
          </div>
          {images.length > 1 ? (
            <div className="absolute inset-x-3 bottom-3 flex gap-2 overflow-x-auto rounded-xl bg-[#061e35]/72 p-2 backdrop-blur">
              {images.map((image, index) => (
                <button
                  className="size-14 shrink-0 overflow-hidden rounded-lg border border-white/20 bg-white/8 p-0 transition hover:border-white/70 data-[active=true]:border-[var(--gold)]"
                  data-active={index === selectedIndex}
                  key={image}
                  onClick={() => {
                    setSelectedIndex(index);
                    slideRefs.current[index]?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
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
