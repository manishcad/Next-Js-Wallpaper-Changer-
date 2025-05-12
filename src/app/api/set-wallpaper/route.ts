import { NextResponse } from 'next/server';
import { setWallpaper } from 'wallpaper';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  let filePath: string | null = null;
  
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Setting wallpaper from URL:', url);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'wallpaper-app');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Download the image
    console.log('Downloading image...');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.buffer();
    filePath = path.join(tempDir, `wallpaper-${Date.now()}.jpg`);
    console.log('Saving image to:', filePath);
    fs.writeFileSync(filePath, buffer);

    // Verify the file exists and has content
    if (!fs.existsSync(filePath)) {
      throw new Error('Failed to save image file');
    }
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error('Saved image file is empty');
    }
    console.log('Image file saved successfully, size:', stats.size, 'bytes');

    // Set as wallpaper
    console.log('Setting wallpaper...');
    try {
      await setWallpaper(filePath);
      console.log('Wallpaper set successfully');
      
      // Add a small delay to ensure the wallpaper is set
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (wallpaperError) {
      console.error('Error setting wallpaper:', wallpaperError);
      throw new Error(`Failed to set wallpaper: ${wallpaperError instanceof Error ? wallpaperError.message : String(wallpaperError)}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in set-wallpaper endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    // Clean up the file only if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        console.log('Cleaning up temporary file:', filePath);
        fs.unlinkSync(filePath);
        console.log('Temporary file cleaned up');
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
  }
} 