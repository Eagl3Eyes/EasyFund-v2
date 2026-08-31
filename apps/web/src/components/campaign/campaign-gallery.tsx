'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

interface CampaignGalleryProps {
  images: string[];
  title: string;
}

export function CampaignGallery({ images, title }: CampaignGalleryProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
        {images.slice(0, 4).map((img, i) => (
          <button
            key={i}
            onClick={() => { setSelectedIndex(i); setOpen(true); }}
            className={`relative overflow-hidden ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}
          >
            <img src={img} alt={`${title} ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform" />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-medium">
                +{images.length - 4} more
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-white hover:text-white/80 z-10">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>

            {images.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 z-10" onClick={prev}>
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 z-10" onClick={next}>
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <img src={images[selectedIndex]} alt={`${title} ${selectedIndex + 1}`} className="max-h-[85vh] max-w-[90vw] object-contain" />

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setSelectedIndex(i)} className={`h-2 w-2 rounded-full transition-colors ${i === selectedIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
