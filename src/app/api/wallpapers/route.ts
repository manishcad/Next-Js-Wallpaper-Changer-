import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Wallpaper {
  id: number;
  url: string;
  title: string;
  author: string;
  detailUrl: string;
}

// Function to get random user agent
const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const defaultHeaders = {
  'User-Agent': getRandomUserAgent(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Referer': 'https://www.google.com/', // Simulate coming from a search engine
  'DNT': '1', // Do Not Track
  'TE': 'Trailers', // Indicates support for trailers
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryRaw = searchParams.get('query');
  const query = queryRaw?.replace(/ /g, '-') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    console.log('Fetching homepage...');
    // First, get cookies from homepage
    const homeResponse = await axios.get('https://www.freepik.com', {
      headers: defaultHeaders,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    const cookies = homeResponse.headers['set-cookie'];
    console.log('Got cookies:', cookies ? 'Yes' : 'No');

    // Add a small delay to avoid rate limiting
    const randomDelay = Math.floor(Math.random() * 5000) + 1000; // 1-6 seconds
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    // Now search for wallpapers
    const searchUrl = `https://www.freepik.com/free-photos-vectors/${encodeURIComponent(query)}/${page}`
    console.log('Searching URL:', searchUrl);

    const { data } = await axios.get(searchUrl, {
      headers: {
        ...defaultHeaders,
        'Referer': 'https://www.freepik.com/',
        'Cookie': cookies ? cookies.join('; ') : '',
        'Sec-Fetch-Site': 'same-origin'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    console.log('Got search response, parsing...');
    const $ = cheerio.load(data);
    const wallpapers: Wallpaper[] = [];

    // Find all figure elements with the resource-thumbnail data-cy attribute
    const figures = $('figure[data-cy="resource-thumbnail"]');
    console.log('Found figures:', figures.length);

    // Process only first 5 images to avoid rate limiting
    for (let i = 0; i < Math.min(figures.length, 12); i++) {
      const $figure = $(figures[i]);
      const detailUrl = $figure.find('a').attr('href');
      const title = $figure.find('img').attr('alt') || 'Untitled';
      const author = $figure.find('.showcase__author').text().trim() || 'Unknown';
      
      if (detailUrl) {
        const fullDetailUrl = detailUrl.startsWith('http') ? detailUrl : `https://www.freepik.com${detailUrl}`;
        
        try {
          // Fetch detail page
          const detailResponse = await axios.get(fullDetailUrl, {
            headers: {
              ...defaultHeaders,
              'Referer': searchUrl,
              'Cookie': cookies ? cookies.join('; ') : '',
              'Sec-Fetch-Site': 'same-origin'
            }
          });

          const $detail = cheerio.load(detailResponse.data);
          const srcset = $detail('div[data-cy="resource-detail-preview"] img').attr('srcset');
          
          if (srcset) {
            // Parse srcset to get the highest resolution image
            const srcsetUrls = srcset.split(',')
              .map(src => {
                const [url, size] = src.trim().split(' ');
                return {
                  url: url,
                  width: parseInt(size.replace('w', ''))
                };
              })
              .sort((a, b) => b.width - a.width);

            const highResUrl = srcsetUrls[0]?.url;

            if (highResUrl) {
              wallpapers.push({
                id: i + 1,
                url: highResUrl,
                title,
                author,
                detailUrl: fullDetailUrl
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch detail page for image ${i + 1}:`, error);
        }
      }
    }

    console.log('Found wallpapers:', wallpapers.length);

    if (wallpapers.length === 0) {
      console.log('No wallpapers found');
      return NextResponse.json(
        { error: 'No wallpapers found for this search term' },
        { status: 404 }
      );
    }

    return NextResponse.json(wallpapers);
  } catch (error) {
    console.error('Error details:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch wallpapers. Please try again later.' },
      { status: 500 }
    );
  }
} 