import React, { useState } from 'react';
import Login from './Login';
import IngredientList from './IngredientList';
import Home from './Home';
import Signup from './Signup';
import Dashboard from './Dashboard';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import '../../App.css';

function Navigation({ currentPage, setCurrentPage }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="nav-container">
      <div className="container nav-content">
        <h1 className="nav-brand">Food Planner</h1>
        <div className="nav-links">
          <button 
            onClick={() => setCurrentPage('home')}
            className="nav-link"
          >
            Home
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => setCurrentPage('ingredients')}
                className="nav-link"
              >
                My Ingredients
              </button>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="nav-link"
              >
                Dashboard
              </button>
              <button 
                onClick={() => {
                  logout();
                  setCurrentPage('home');
                }}
                className="nav-link"
              >
                Logout ({user?.username})
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setCurrentPage('login')}
                className="nav-link"
              >
                Login
              </button>
              <button 
                onClick={() => setCurrentPage('signup')}
                className="nav-link"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated } = useAuth();

  // Redirect to login if trying to access protected pages
  React.useEffect(() => {
    if (!isAuthenticated && (currentPage === 'ingredients' || currentPage === 'dashboard')) {
      setCurrentPage('login');
    }
  }, [currentPage, isAuthenticated]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'login':
        return <Login onLoginSuccess={() => setCurrentPage('ingredients')} />;
      case 'signup':
        return <Signup onSignupSuccess={() => setCurrentPage('ingredients')} />;
      case 'ingredients':
        return <IngredientList />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container main-content">
        {renderPage()}
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Food Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;