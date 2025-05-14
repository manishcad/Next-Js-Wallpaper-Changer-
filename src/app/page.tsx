'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import WallpaperGrid from '@/components/WallpaperGrid';

interface Wallpaper {
  id: number;
  url: string;
  title: string;
  author: string;
}

export default function Home() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [currentQuery, setCurrentQuery] = useState<string>('Space');

  const handleSearch = async (query: string, pageNumber: number = 1): Promise<void> => {
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setPage(pageNumber);
    try {
      const response = await fetch(`/api/wallpapers?query=${encodeURIComponent(query)}&page=${pageNumber}`);
      if (!response.ok) throw new Error('Failed to fetch wallpapers');
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setWallpapers(data);
      } else {
        setWallpapers([]);
        setError('No wallpapers found.');
      }
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      setWallpapers([]);
      setError('Error fetching wallpapers.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    handleSearch(currentQuery, page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      handleSearch(currentQuery, page - 1);
    }
  };

  const handleSetWallpaper = async (url: string) => {
    try {
      const response = await fetch('/api/set-wallpaper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        alert('Wallpaper set successfully!');
      } else {
        throw new Error('Failed to set wallpaper');
      }
    } catch (error) {
      console.error('Error setting wallpaper:', error);
      alert('Failed to set wallpaper. Please try again.');
    }
  };

  useEffect(() => {
    console.log("UseEffect Running")
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {

        const response = await fetch(`/api/wallpapers?query=${encodeURIComponent(currentQuery)}&page=${page}`);
        if (!response.ok) throw new Error('Failed to fetch wallpapers');
  
        const data = await response.json();
  
        if (Array.isArray(data) && data.length > 0) {
          setWallpapers(data);
        } else {
          setWallpapers([]);
          setError('No wallpapers found.');
        }
      } catch (error) {
        console.error('Error fetching wallpapers:', error);
        setWallpapers([]);
        setError('Error fetching wallpapers.');
      } finally {
        setLoading(false);
      }
    };
  
    if (currentQuery) {
      fetchData();
    }
  }, [currentQuery, page]);
  
      
     
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text tracking-wide drop-shadow-md">
  Find Your Perfect Wallpaper
</h1>

        <SearchBar onSearch={(query) => handleSearch(query, 1)} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mt-8 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : wallpapers.length > 0 ? (
          <>
            <div className="mt-8">
              <WallpaperGrid wallpapers={wallpapers} onSetWallpaper={handleSetWallpaper} />
            </div>
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
              >
                Prev
              </button>
              <span className="text-gray-700 font-semibold">Page {page}</span>
              <button
                onClick={handleNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 mt-8 p-4 bg-gray-50 rounded-lg">
            Search for wallpapers to get started
          </div>
        )}
      </div>
    </main>
  );
}
