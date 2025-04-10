import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Fetch ingredients when component mounts or user changes
  useEffect(() => {
    if (user?.username) {
      fetchIngredients(user.username);
    }
  }, [user]);

  const fetchIngredients = async (username) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/ingredients?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      } else {
        setErrorMessage('Failed to load ingredients');
      }
    } catch (error) {
      setErrorMessage('Error connecting to server');
      console.error('Error fetching ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim() || !user?.username) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/add_ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          ingredients: [newIngredient]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients);
        setNewIngredient('');
      } else {
        setErrorMessage('Failed to add ingredient');
      }
    } catch (error) {
      setErrorMessage('Error connecting to server');
      console.error('Error adding ingredient:', error);
    }
  };

  const toggleIngredient = async (index) => {
    if (!user?.username) return;
    
    const updatedIngredients = [...ingredients];
    const ingredient = updatedIngredients[index];
    
    // If the ingredient is a string, convert to object
    // This handles transition from simple strings to objects with checked status
    if (typeof ingredient === 'string') {
      updatedIngredients[index] = { 
        name: ingredient, 
        checked: true 
      };
    } else {
      updatedIngredients[index] = { 
        ...ingredient, 
        checked: !ingredient.checked 
      };
    }
    
    setIngredients(updatedIngredients);
    
    try {
      await fetch('http://localhost:5000/api/update_ingredient_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          ingredients: updatedIngredients
        })
      });
    } catch (error) {
      console.error('Error updating ingredient status:', error);
    }
  };

  const removeIngredient = async (index) => {
    if (!user?.username) return;
    
    const ingredientToRemove = ingredients[index];
    const name = typeof ingredientToRemove === 'string' 
      ? ingredientToRemove 
      : ingredientToRemove.name;
    
    try {
      const response = await fetch('http://localhost:5000/api/remove_ingredient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          ingredient: name
        })
      });
      
      if (response.ok) {
        const updatedIngredients = [...ingredients];
        updatedIngredients.splice(index, 1);
        setIngredients(updatedIngredients);
      } else {
        setErrorMessage('Failed to remove ingredient');
      }
    } catch (error) {
      setErrorMessage('Error connecting to server');
      console.error('Error removing ingredient:', error);
    }
  };

  if (!isAuthenticated) {
    return <div className="card">Please log in to view your ingredients</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="form-title">My Ingredients Checklist</h2>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={addIngredient} className="ingredient-form">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add new ingredient"
            className="input-field ingredient-input"
          />
          <button 
            type="submit" 
            className="btn-primary ingredient-add-btn"
          >
            Add
          </button>
        </form>
        
        {isLoading ? (
          <div className="text-center py-8">Loading ingredients...</div>
        ) : (
          <div className="ingredient-list">
            {ingredients.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No ingredients yet</div>
            ) : (
              <ul>
                {ingredients.map((ingredient, index) => {
                  // Handle both string and object formats
                  const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
                  const isChecked = typeof ingredient === 'object' && ingredient.checked;
                  
                  return (
                    <li 
                      key={index} 
                      className="ingredient-item"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked || false}
                          onChange={() => toggleIngredient(index)}
                          className="ingredient-checkbox"
                        />
                        <span className={isChecked ? "ingredient-text-checked" : ""}>
                          {name}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeIngredient(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IngredientList;