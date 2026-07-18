"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex shrink-0 gap-2 sm:flex-col">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
              active === i ? "border-orange-400" : "border-gray-200"
            }`}
          >
            <Image src={src} alt={`${title} thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={images[active]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
