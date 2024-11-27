import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export const handler: Handler = async (event) => {
  const key = event.queryStringParameters?.key;

  if (!key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No key provided' }),
    };
  }

  try {
    const store = getStore('menu-images');
    const blob = await store.get(key);

    if (!blob) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Image not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
      body: blob.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error serving image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to serve image' }),
    };
  }
}