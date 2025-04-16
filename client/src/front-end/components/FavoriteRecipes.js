import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function FavoriteRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.username) {
      fetchFavorites(user.username);
    }
  }, [user, isAuthenticated]);

  const fetchFavorites = async (username) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/favorites?username=${username}`
      );

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to load favorite recipes");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Error connecting to server");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card">
        <p>Please log in to view your favorite recipes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Your Favorite Recipes</h2>
        {error && <div className="error-message">{error}</div>}

        {recipes.length === 0 ? (
          <p className="text-gray-500">No favorite recipes yet.</p>
        ) : (
          <div className="grid gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <h3 className="font-semibold text-lg">{recipe.name}</h3>
                <p className="text-sm text-gray-600">{recipe.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoriteRecipes;
