import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import Catalog from './pages/Catalog'
import Configurator from './pages/Configurator'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

// AppSec Demo Guardrail: Protected Route to enforce local JWT-simulated authentication
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('drone-auth-token')
  if (!token) {
    // Redirect to login if token is missing
    return <Navigate to="/login" replace />
  }
  return children
}

export function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-industrial-bg text-industrial-fg selection:bg-industrial-accent selection:text-white">
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/configurator" element={<Configurator />} />
            
            {/* Protected Route for the Fleet Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Standardized Footer */}
        <Footer />
        
      </div>
    </Router>
  )
}

export default App
