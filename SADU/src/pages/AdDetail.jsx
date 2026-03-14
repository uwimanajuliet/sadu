import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApplyModal from '../components/ApplyModal.jsx';
import API from '../config.js';

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await API.get('/ads/' + id);
        setAd(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  if (!ad) {
    return <div className="text-center py-20 text-gray-400">Ad not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:underline text-sm"
      >
        &#8592; Back
      </button>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        {ad.image ? (
          <img
            src={"http://localhost:5000/uploads/" + ad.image}
            alt={ad.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-blue-50 flex items-center justify-center text-6xl">
            {ad.type === 'internship' ? '🎓' : '🚌'}
          </div>
        )}

        <div className="p-6">

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            {ad.category_name || ad.type}
          </span>

          <h1 className="text-2xl font-bold text-gray-800 mt-3">{ad.title}</h1>

          <p className="text-gray-600 mt-4 leading-relaxed">{ad.description}</p>

          <div className="mt-6 space-y-3">

            {ad.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">📍</span>
                <span>{ad.location}</span>
              </div>
            )}

            {ad.contact_info && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-lg">📞</span>
                <span>{ad.contact_info}</span>
              </div>
            )}

            {ad.deadline && (
              <div className="flex items-center gap-2 text-red-500">
                <span className="text-lg">⏰</span>
                <span>Deadline: {new Date(ad.deadline).toLocaleDateString()}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">🗂️</span>
              <span className="capitalize">Type: {ad.type}</span>
            </div>

          </div>

          {ad.type === 'internship' && (
            <div className="mt-8">
              <button
                onClick={() => setShowModal(true)}
                className="block w-full text-center bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition"
              >
                Apply Now
              </button>
            </div>
          )}

          {ad.type === 'service' && ad.contact_info && (
            <div className="mt-8 bg-blue-50 rounded-xl p-4">
              <p className="font-semibold text-blue-700">Contact for this service:</p>
              <p className="text-gray-700 mt-1">{ad.contact_info}</p>
            </div>
          )}

        </div>
      </div>

      {showModal && (
        <ApplyModal ad={ad} onClose={() => setShowModal(false)} />
      )}

    </div>
  );
};

export default AdDetail;