import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: 'Missing Unsplash Access Key' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'space';
  const perPage = searchParams.get('per_page') || 12;
  const page = searchParams.get('page') || 1;

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: perPage,
        page,
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    // Format results for frontend
    const formatted = response.data.results.map((item) => ({
      id: item.id,
      url: item.urls.regular,
      title: item.description || item.alt_description || 'Untitled',
      author: item.user?.name || 'Unknown',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching images:', error.message);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
