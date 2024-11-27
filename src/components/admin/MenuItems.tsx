import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
  deleteMenuImage
} from '../../lib/firebase';
import type { MenuItem } from '../../types';

export function MenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'meat' as 'meat' | 'chicken',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      setImageFile(acceptedFiles[0]);
      setUploadError(null);
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        setUploadError('File is too large. Maximum size is 2MB.');
      } else if (error?.code === 'file-invalid-type') {
        setUploadError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      } else {
        setUploadError('Failed to upload file. Please try again.');
      }
    },
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const fetchedItems = await getMenuItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'meat',
    });
    setImageFile(null);
    setEditingItem(null);
    setIsAddModalOpen(false);
    setUploadError(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, imagePath?: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteMenuItem(id, imagePath);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !editingItem) {
      setUploadError('Please select an image');
      return;
    }

    setIsSaving(true);
    setUploadError(null);
    
    try {
      let imageUrl = editingItem?.image;
      let imagePath = editingItem?.imagePath;

      if (imageFile) {
        const uploadResult = await uploadMenuImage(imageFile);
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;

        if (editingItem?.imagePath) {
          await deleteMenuImage(editingItem.imagePath);
        }
      }

      const itemData = {
        ...formData,
        image: imageUrl || '',
        imagePath: imagePath || '',
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
      } else {
        await addMenuItem(itemData);
      }

      resetForm();
      await loadMenuItems();

      const message = editingItem ? 'Item updated successfully!' : 'New item added successfully!';
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      setUploadError(error.message || 'Failed to save menu item');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin text-dibi-accent1" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-dibi-fg">{item.name}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-semibold text-dibi-accent1">
                  {item.price.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-600 hover:text-dibi-accent1 transition-colors"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.imagePath)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-dibi-accent1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="input-primary w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="input-primary w-full"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (XOF)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) })
                    }
                    required
                    min="0"
                    className="input-primary w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'meat' | 'chicken',
                      })
                    }
                    required
                    className="input-primary w-full"
                  >
                    <option value="meat">Meat</option>
                    <option value="chicken">Chicken</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                      isDragActive
                        ? 'border-dibi-accent1 bg-dibi-accent1 bg-opacity-5'
                        : 'border-gray-300 hover:border-dibi-accent1'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload
                      size={24}
                      className={`mx-auto mb-2 ${
                        isDragActive ? 'text-dibi-accent1' : 'text-gray-400'
                      }`}
                    />
                    <p className="text-sm text-gray-600">
                      {imageFile
                        ? imageFile.name
                        : editingItem?.image
                        ? 'Click to change image'
                        : 'Drop an image here or click to select'}
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}