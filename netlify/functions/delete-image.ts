import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

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
    const { key } = JSON.parse(event.body || '{}');
    
    if (!key) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No key provided' }),
      };
    }

    const store = getStore('menu-images');
    
    // Check if the image exists before attempting deletion
    const exists = await store.get(key);
    if (!exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Image not found' }),
      };
    }

    await store.delete(key);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Image deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete image' }),
    };
  }
};