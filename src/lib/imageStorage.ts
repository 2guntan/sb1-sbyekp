import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  fileType: 'image/jpeg',
  alwaysKeepResolution: true,
  initialQuality: 0.8,
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    let processedFile = file;

    // Compress image if it's too large
    if (file.size > MAX_FILE_SIZE) {
      try {
        processedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      } catch (compressionError) {
        console.error('Error compressing image:', compressionError);
        throw new Error('Failed to compress image. Please try a smaller image.');
      }
    }

    // Create unique filename
    const fileExtension = processedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    const formData = new FormData();
    formData.append('file', processedFile);
    formData.append('filename', uniqueFilename);

    const response = await fetch('/.netlify/functions/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image. Please try again.');
    }

    const data = await response.json();
    
    if (!data.url) {
      throw new Error('Invalid response from upload service');
    }

    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image. Please try again.');
  }
};

export const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `/.netlify/functions/serve-image?key=${encodeURIComponent(path)}`;
};

export const deleteImage = async (path: string): Promise<void> => {
  if (!path || path.startsWith('http')) return;

  try {
    const response = await fetch('/.netlify/functions/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: path }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image. Please try again.');
  }
};