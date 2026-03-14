import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApplyModal from './ApplyModal.jsx';

const AdCard = ({ ad }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">

      {ad.image ? (
        <img
          src={"http://localhost:5000/uploads/" + ad.image}
          alt={ad.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-blue-50 flex items-center justify-center text-4xl">
          {ad.type === 'internship' ? '🎓' : '🚌'}
        </div>
      )}

      <div className="p-4">

        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          {ad.category_name || ad.type}
        </span>

        <h3 className="font-bold text-gray-800 mt-2 text-lg">{ad.title}</h3>

        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{ad.description}</p>

        {ad.location && (
          <p className="text-gray-400 text-xs mt-2">📍 {ad.location}</p>
        )}

        {ad.deadline && (
          <p className="text-red-400 text-xs mt-1">
            Deadline: {new Date(ad.deadline).toLocaleDateString()}
          </p>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Link
            to={"/ads/" + ad.id}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            View Details
          </Link>

          {ad.type === 'internship' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-500 text-white text-sm px-3 py-1 rounded-lg hover:bg-green-600"
            >
              Apply Now
            </button>
          )}
        </div>

      </div>

      {showModal && (
        <ApplyModal ad={ad} onClose={() => setShowModal(false)} />
      )}

    </div>
  );
};

export default AdCard;