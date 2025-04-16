import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login";
import IngredientList from "./IngredientList";
import Home from "./Home";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import RecipeSuggestions from "./RecipeSuggestions";
import RecipeDetail from "./RecipeDetail";
import RecipeChat from "./RecipeChat";  // Add this import
import { AuthProvider, useAuth } from "../../context/AuthContext";
import FavoriteRecipes from "./FavoriteRecipes";
import "../../App.css";
import { Heart } from "lucide-react";


function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="nav-container">
      <div className="container nav-content">
        <h1 className="nav-brand">Food Planner</h1>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/ingredients" className="nav-link">
                My Ingredients
              </Link>
              <Link to="/recipes" className="nav-link">
                Recipe Suggestions
              </Link>
              <Link to="/recipe-chat" className="nav-link">  {/* Add this link */}
                Recipe Chat
              </Link>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/favorites" className="nav-link">
                Favorites
              </Link>
              <button onClick={logout} className="nav-link">
                Logout ({user?.username})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <main className="container main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/ingredients"
              element={
                <ProtectedRoute>
                  <IngredientList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute>
                  <RecipeSuggestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe-chat"  // Add this new route
              element={
                <ProtectedRoute>
                  <RecipeChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe/:recipeId"
              element={
                <ProtectedRoute>
                  <RecipeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
              <ProtectedRoute>
                <FavoriteRecipes />
              </ProtectedRoute>
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
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <p>© {new Date().getFullYear()} Food Planner. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App