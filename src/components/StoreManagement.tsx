// ... previous imports remain the same ...

export function StoreManagement() {
  // ... previous state declarations remain the same ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !editingItem) {
      alert('Please select an image');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          ...formData,
          ...(selectedFile && { image: selectedFile }),
        });
      } else {
        await addMenuItem(formData, selectedFile!);
      }

      // Reset form and close modal first for better UX
      setIsAddModalOpen(false);
      setEditingItem(null);
      setSelectedFile(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'meat',
      });

      // Then refresh menu items
      const updatedItems = await getMenuItems();
      setItems(updatedItems);

      // Show success message
      const message = editingItem ? 'Item updated successfully!' : 'New item added successfully!';
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
      }, 3000);

    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ... rest of the component remains the same ...
}