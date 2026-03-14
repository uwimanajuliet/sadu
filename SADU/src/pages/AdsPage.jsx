import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../config.js';
import AdCard from '../components/AdCard.jsx';

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const typeFilter = searchParams.get('type') || 'all';
  const categoryFilter = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [adsRes, catRes] = await Promise.all([
          API.get('/ads'),
          API.get('/categories'),
        ]);
        setAds(adsRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAds = ads.filter((ad) => {
    const matchType = typeFilter === 'all' || ad.type === typeFilter;
    const matchCategory = categoryFilter === 'all' || String(ad.category_id) === categoryFilter;
    return matchType && matchCategory;
  });

  const handleType = (type) => {
    setSearchParams({ type, category: 'all' });
  };

  const handleCategory = (categoryId) => {
    setSearchParams({ type: typeFilter, category: categoryId });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Ads</h1>

      {/* Type Filter Tabs */}
      <div className="flex gap-3 mb-6">
        {['all', 'service', 'internship'].map((type) => (
          <button
            key={type}
            onClick={() => handleType(type)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
              typeFilter === type
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '🌐 All' : type === 'service' ? '🚌 Services' : '🎓 Internships'}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            categoryFilter === 'all'
              ? 'bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategory(String(cat.id))}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              categoryFilter === String(cat.id)
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-4">{filteredAds.length} result(s) found</p>

      {/* Ads Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No ads found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}

    </div>
  );
};

export default AdsPage;