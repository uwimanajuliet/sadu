import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;