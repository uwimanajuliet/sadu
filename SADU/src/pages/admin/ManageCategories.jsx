import { useEffect, useState } from 'react';
import API from '../../config.js';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      if (editingCat) {
        await API.put('/categories/' + editingCat.id, { name });
        setSuccess('Category updated successfully');
      } else {
        await API.post('/categories', { name });
        setSuccess('Category created successfully');
      }
      setName('');
      setEditingCat(null);
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete('/categories/' + id);
      setSuccess('Category deleted successfully');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete category');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = () => {
    setName('');
    setEditingCat(null);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h1>

      {/* Success / Error */}
      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {editingCat ? 'Edit Category' : 'Add New Category'}
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition font-semibold text-sm"
          >
            {editingCat ? 'Update' : 'Add'}
          </button>
          {editingCat && (
            <button
              onClick={handleCancel}
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No categories yet.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ManageCategories;