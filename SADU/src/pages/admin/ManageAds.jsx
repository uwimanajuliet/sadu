import { useEffect, useState } from 'react';
import API from '../../config.js';

const ManageAds = () => {
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = {
    title: '',
    description: '',
    category_id: '',
    type: 'service',
    location: '',
    contact_info: '',
    google_form_link: '',
    deadline: '',
    image: null,
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [adsRes, catRes] = await Promise.all([
        API.get('/ads'),
        API.get('/categories'),
      ]);
      setAds(adsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      category_id: ad.category_id || '',
      type: ad.type || 'service',
      location: ad.location || '',
      contact_info: ad.contact_info || '',
      google_form_link: ad.google_form_link || '',
      deadline: ad.deadline ? ad.deadline.split('T')[0] : '',
      image: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      await API.delete('/ads/' + id);
      setSuccess('Ad deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete ad');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.type) {
      setError('Title and type are required');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category_id', formData.category_id);
    data.append('type', formData.type);
    data.append('location', formData.location);
    data.append('contact_info', formData.contact_info);
    data.append('google_form_link', formData.google_form_link);
    data.append('deadline', formData.deadline);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingAd) {
        const res = await API.put('/ads/' + editingAd.id, data);
        console.log('Update response:', res.data);
        setSuccess('Ad updated successfully');
      } else {
        const res = await API.post('/ads', data);
        console.log('Create response:', res.data);
        setSuccess('Ad created successfully');
      }
      setFormData(emptyForm);
      setEditingAd(null);
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to save ad. Check console for details.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingAd(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Ads</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition font-semibold"
          >
            + Add New Ad
          </button>
        )}
      </div>

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

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {editingAd ? 'Edit Ad' : 'Create New Ad'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ad title"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="service">Service</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Kigali"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Info</label>
              <input
                type="text"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                placeholder="Phone or email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.type === 'internship' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Google Form Link</label>
                  <input
                    type="text"
                    name="google_form_link"
                    value={formData.google_form_link}
                    onChange={handleChange}
                    placeholder="https://forms.google.com/..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the service or internship..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
              {editingAd && editingAd.image && (
                <p className="text-xs text-gray-400 mt-1">
                  Current image: {editingAd.image} (upload new to replace)
                </p>
              )}
            </div>

          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition font-semibold"
            >
              {editingAd ? 'Update Ad' : 'Create Ad'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No ads yet.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {ad.image ? (
                      <img
                        src={"http://localhost:5000/uploads/" + ad.image}
                        alt={ad.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl">
                        {ad.type === 'internship' ? '🎓' : '🚌'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{ad.title}</td>
                  <td className="px-4 py-3">
                    <span className={
                      ad.type === 'internship'
                        ? 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs'
                        : 'bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs'
                    }>
                      {ad.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ad.category_name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{ad.location || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
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

export default ManageAds;