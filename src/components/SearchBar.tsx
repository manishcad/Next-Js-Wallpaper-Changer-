'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedQuery = query.trim().replace(/ /g, '-');
    setQuery(formattedQuery);
    onSearch(formattedQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto px-4">
      <div className="relative shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search wallpapers (e.g., galaxy, mountains, neon)..."
          className=" text-black w-full text-lg sm:text-2xl px-6 py-4 pr-32 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-2 rounded-full hover:opacity-90 transition duration-300 shadow-md"
        >
          Search
        </button>
      </div>
    </form>
  );
}
