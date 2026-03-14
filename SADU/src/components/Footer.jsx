import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <h3 className="text-lg font-bold mb-4">🚌 Transport & Tourism</h3>
            <p className="text-blue-200 text-sm">
              Connecting people with the best transport, tourism services and internship opportunities in Rwanda.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-blue-200 hover:text-white text-sm">Home</Link>
              <Link to="/ads" className="block text-blue-200 hover:text-white text-sm">Ads</Link>
              <Link to="/about" className="block text-blue-200 hover:text-white text-sm">About Us</Link>
              <Link to="/contact" className="block text-blue-200 hover:text-white text-sm">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <div className="space-y-2 text-blue-200 text-sm">
              <p>📍 Kigali, Rwanda</p>
              <p>📞 +250 789 846 899</p>
              <p>📧 julietuwimana30@gmail.com</p>
              <p>🕐 Mon - Fri: 8:00 AM - 6:00 PM</p>
            </div>
          </div>

        </div>

        <div className="border-t border-blue-600 mt-8 pt-6 text-center text-blue-200 text-sm">
          <p>© 2026 Transport & Tourism. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;