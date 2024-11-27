import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { parse } from '@netlify/functions/parser';
import sharp from 'sharp';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { files } = await parse(event);
    const file = files[0];

    if (!file || !file.content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file provided' }),
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid file type' }),
      };
    }

    if (file.content.length > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File too large' }),
      };
    }

    try {
      const processedImage = await sharp(file.content)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: true,
        })
        .toBuffer();

      const store = getStore('menu-images');
      const key = `images/${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, '')}`;

      await store.set(key, processedImage, {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url: key,
          success: true,
        }),
      };
    } catch (processingError) {
      console.error('Image processing error:', processingError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Failed to process image' }),
      };
    }
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to upload image' }),
    };
  }
};