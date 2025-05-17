'use client';

import Image from 'next/image';
import { useState } from 'react';
interface Wallpaper {
  id: number;
  url: string;
  title: string;
  author: string;
}

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  onSetWallpaper: (url: string) => void;
}

export default function WallpaperGrid({ wallpapers,onSetWallpaper }: WallpaperGridProps) {
  const [isSetting, setIsSetting] = useState<number | null>(null);
  const handleSetWallpaper = async (url: string, id: number) => {
    try {
      setIsSetting(id);
      const response = await fetch('/api/set-wallpaper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to set wallpaper');
      }

      onSetWallpaper(url);
    } catch (error) {
      console.error('Error setting wallpaper:', error);
      alert('Failed to set wallpaper. Please try again.');
    } finally {
      setIsSetting(null);
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {wallpapers.map((wallpaper) => (
        <div key={wallpaper.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={wallpaper.url}
              alt={wallpaper.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={wallpaper.id <= 3}
            />
      <div className="absolute inset-0 flex items-center justify-center  bg-opacity-30">
        <div className="flex flex-col gap-2 p-2 md:p-4">
          <button
            onClick={() => handleSetWallpaper(wallpaper.url, wallpaper.id)}
            disabled={isSetting === wallpaper.id}
            className={`bg-blue-600 text-white text-sm md:text-base px-3 py-2 rounded-md ${
              isSetting === wallpaper.id ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {isSetting === wallpaper.id ? 'Setting...' : 'Set as Wallpaper'}
          </button>

          <a
             href={`/api/download?url=${encodeURIComponent(wallpaper.url)}`}
            download
            className="bg-green-600 text-white text-sm md:text-base px-3 py-2 rounded-md text-center"
          >
            Download
          </a>
    </div>
  </div>
</div>

          <div className="p-4">
            <h3 className="text-lg font-semibold truncate">{wallpaper.title}</h3>
            <p className="text-sm text-gray-600">By {wallpaper.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
