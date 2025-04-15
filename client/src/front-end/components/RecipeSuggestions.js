import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import RecipeCard from "./RecipeCard"

function RecipeSuggestions() {
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [threshold, setThreshold] = useState(0.5) // Default match threshold
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (user?.username) {
      fetchRecipeSuggestions(user.username)
    }
  }, [user, threshold])

  const fetchRecipeSuggestions = async (username) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes/suggest?username=${username}&threshold=${threshold}`,
      )

      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch recipe suggestions")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error fetching recipe suggestions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="card">Please log in to view recipe suggestions</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="form-title">Recipe Suggestions</h2>
        <p className="text-gray-600 mb-4">Based on the ingredients you have, here are some recipes you can make:</p>

        {error && <div className="error-message">{error}</div>}

        <div className="mb-4">
          <label className="form-label">Match Threshold</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={threshold}
              onChange={(e) => setThreshold(Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{Math.round(threshold * 100)}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Adjust to see recipes where you have at least this percentage of the required ingredients
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading recipe suggestions...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No recipe suggestions found with your current ingredients.</p>
            <p className="text-gray-500 mt-2">Try adding more ingredients or lowering the match threshold.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeSuggestions