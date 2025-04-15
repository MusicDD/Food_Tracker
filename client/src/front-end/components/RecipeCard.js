import { Link } from "react-router-dom" // You'll need to install react-router-dom

function RecipeCard({ recipe }) {
  const matchPercentage = Math.round(recipe.match_percentage * 100)

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{recipe.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              matchPercentage >= 80
                ? "bg-green-100 text-green-800"
                : matchPercentage >= 50
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {matchPercentage}% match
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>

        <div className="flex gap-4 text-sm text-gray-500 mb-3">
          <div>
            <span className="font-medium">Prep:</span> {recipe.preparation_time} min
          </div>
          <div>
            <span className="font-medium">Cook:</span> {recipe.cooking_time} min
          </div>
          <div>
            <span className="font-medium">Serves:</span> {recipe.servings}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">You have:</h4>
          <div className="flex flex-wrap gap-1">
            {recipe.matching_ingredients.map((ingredient, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {recipe.missing_ingredients.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">You need:</h4>
            <div className="flex flex-wrap gap-1">
              {recipe.missing_ingredients.map((ingredient, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <Link to={`/recipe/${recipe.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View Recipe →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RecipeCard