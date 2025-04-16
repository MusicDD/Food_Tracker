import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" // You'll need to install react-router-dom
import { useAuth } from "../../context/AuthContext"
import HeartButton from "./HeartButton"

function RecipeDetail() {
  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails(recipeId)
      if (user?.username) {
        checkIfFavorite(user.username, recipeId)
      }
    }
  }, [recipeId, user])

  const fetchRecipeDetails = async (id) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`)

      if (response.ok) {
        const data = await response.json()
        setRecipe(data.recipe)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch recipe details")
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error fetching recipe details:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const checkIfFavorite = async (username, recipeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/favorites?username=${username}`)

      if (response.ok) {
        const data = await response.json()
        const favorites = data.recipes || []
        setIsFavorite(favorites.some((fav) => fav.id === Number.parseInt(recipeId)))
      }
    } catch (err) {
      console.error("Error checking favorite status:", err)
    }
  }

  const toggleFavorite = async () => {
    if (!isAuthenticated || !user?.username) {
      navigate("/login")
      return
    }

    try {
      const method = isFavorite ? "DELETE" : "POST"
      const response = await fetch("http://localhost:5000/api/recipes/favorite", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          recipe_id: recipeId,
        }),
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Failed to ${isFavorite ? "remove from" : "add to"} favorites`)
      }
    } catch (err) {
      setError("Error connecting to server")
      console.error("Error toggling favorite:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-8">Loading recipe details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-8">Recipe not found</div>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{recipe.name}</h1>
          <HeartButton
          recipeId={recipe.id}
          isFavorite={isFavorite}
          onToggle={toggleFavorite}
          className="text-red-600 hover:text-red-700"
          />
        </div>

        <p className="text-gray-600 mb-6">{recipe.description}</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="px-3 py-2 bg-gray-100 rounded-md">
            <span className="block text-xs text-gray-500">Prep Time</span>
            <span className="font-medium">{recipe.preparation_time} min</span>
          </div>
          <div className="px-3 py-2 bg-gray-100 rounded-md">
            <span className="block text-xs text-gray-500">Cook Time</span>
            <span className="font-medium">{recipe.cooking_time} min</span>
          </div>
          <div className="px-3 py-2 bg-gray-100 rounded-md">
            <span className="block text-xs text-gray-500">Servings</span>
            <span className="font-medium">{recipe.servings}</span>
          </div>
          <div className="px-3 py-2 bg-gray-100 rounded-md">
            <span className="block text-xs text-gray-500">Difficulty</span>
            <span className="font-medium capitalize">{recipe.difficulty}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                  <span>
                    {ingredient.quantity} {ingredient.unit} {ingredient.ingredient}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="space-y-3 list-decimal list-inside">
              {recipe.instructions.replace(/\r\n/g, '\n').split('\n').map((step, index) => {
              const cleanStep = step.replace(/^\s*\d+[\.\)]\s*/, '').trim()
              if (!cleanStep) return null
                return (
                <li key={index} className="text-gray-700">
                  {cleanStep}
                </li>
                )
              })}
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Back to Suggestions
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail