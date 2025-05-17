'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function WallpaperCard({ wallpaper }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-xl">
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
          <a
            href={wallpaper.url}
            download
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
