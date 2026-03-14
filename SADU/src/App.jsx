import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AdsPage from './pages/AdsPage.jsx';
import AdDetail from './pages/AdDetail.jsx';
import Login from './pages/Login.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageAds from './pages/admin/ManageAds.jsx';
import ManageCategories from './pages/admin/ManageCategories.jsx';
import ManageCars from './pages/admin/ManageCars.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Internships from './pages/Internships.jsx';
import Tourism from './pages/Tourism.jsx';
import CarsPage from './pages/CarsPage.jsx'; // ✅ only CarsPage — removed old Cars.jsx
import AIAssistant from './components/AIAssistant.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/tourism"     element={<Tourism />} />
            <Route path="/cars"        element={<CarsPage />} /> {/* ✅ only one /cars route */}
            <Route path="/ads"         element={<AdsPage />} />
            <Route path="/ads/:id"     element={<AdDetail />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/about"       element={<About />} />
            <Route path="/contact"     element={<Contact />} />

            <Route path="/admin" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin/ads" element={
              <ProtectedRoute><ManageAds /></ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute><ManageCategories /></ProtectedRoute>
            } />
            <Route path="/admin/cars" element={
              <ProtectedRoute><ManageCars /></ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
  <ProtectedRoute><ManageBookings /></ProtectedRoute>
} />
          </Routes>
        </main>
        <Footer />
        <AIAssistant />
      </div>
    </BrowserRouter>
  );
}

export default App;
