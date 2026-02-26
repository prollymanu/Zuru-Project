import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TravelGuide from './pages/TravelGuide';
import WalletPage from './pages/WalletPage';
import ServiceComingSoon from './pages/ServiceComingSoon';
import RestaurantHome from './pages/listings/RestaurantHome';
import RestaurantDetail from './pages/listings/RestaurantDetail';
import HotelHome from './pages/listings/HotelHome';
import HotelDetail from './pages/listings/HotelDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import useIdleTimer from './hooks/useIdleTimer';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
    <p className="text-neutral-500 font-medium tracking-widest uppercase text-xs">Authenticating...</p>
  </div>
);

const AppContent = () => {
  const { logout, isAuthenticated, isLoading } = useAuth();

  // 15 minutes idle timer
  useIdleTimer(15, () => {
    if (isAuthenticated) {
      logout();
      alert("Session expired due to inactivity.");
    }
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Service Routes */}
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route path="/listings/restaurants" element={<ProtectedRoute><RestaurantHome /></ProtectedRoute>} />
      <Route path="/listings/restaurants/:id" element={<ProtectedRoute><RestaurantDetail /></ProtectedRoute>} />
      <Route path="/listings/hotels" element={<ProtectedRoute><HotelHome /></ProtectedRoute>} />
      <Route path="/listings/hotels/:id" element={<ProtectedRoute><HotelDetail /></ProtectedRoute>} />
      <Route path="/short-stays" element={<ProtectedRoute><ServiceComingSoon /></ProtectedRoute>} />
      <Route path="/housing" element={<ProtectedRoute><ServiceComingSoon /></ProtectedRoute>} />
      <Route path="/legal" element={<ProtectedRoute><ServiceComingSoon /></ProtectedRoute>} />
      <Route path="/car-hire" element={<ProtectedRoute><ServiceComingSoon /></ProtectedRoute>} />
      <Route path="/laundry" element={<ProtectedRoute><ServiceComingSoon /></ProtectedRoute>} />
      <Route path="/cabs" element={<ProtectedRoute><ServiceComingSoon /></ProtectedRoute>} />

      <Route
        path="/travel-guide"
        element={
          <ProtectedRoute>
            <TravelGuide />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
