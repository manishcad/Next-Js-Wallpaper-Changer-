'use client';

import { useState } from 'react';
import Image from 'next/image';

interface WallpaperCardProps {
  wallpaper: {
    id: number;
    url: string;
    title: string;
    author: string;
    detailUrl: string;
  };
  onSetWallpaper: (url: string) => void;
}

export default function WallpaperCard({ wallpaper, onSetWallpaper }: WallpaperCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Failed to load image</p>
          </div>
        ) : (
          <Image
            src={wallpaper.url}
            alt={wallpaper.title}
            fill
            className="object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={wallpaper.id <= 3}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{wallpaper.title}</h3>
        <p className="text-gray-600 mb-4">By {wallpaper.author}</p>
        <div className="flex justify-between items-center">
          <a
            href={wallpaper.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            View Details
          </a>
          <button
            onClick={() => onSetWallpaper(wallpaper.url)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Set as Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
} 