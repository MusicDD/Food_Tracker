import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function RecipeChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get recipes based on ingredients
      const ingredients = input.split(',').map(i => i.trim()).filter(i => i);
      const response = await fetch('http://localhost:5000/api/chat/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          username: user?.username
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRecipes(data.recipes || []);
        if (data.recipes?.length > 0) {
          setMessages(prev => [...prev, {
            text: `I found ${data.recipes.length} recipe(s) you can make!`,
            sender: 'bot'
          }]);
        } else {
          setMessages(prev => [...prev, {
            text: "I couldn't find any recipes with those ingredients. Try adding more ingredients!",
            sender: 'bot'
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          text: data.error || "Sorry, I couldn't process your request.",
          sender: 'bot'
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "There was an error connecting to the server.",
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="form-title">Recipe Assistant</h2>
        <p className="text-gray-600 mb-4">Enter ingredients you have (comma separated)</p>
        
        {/* Chat messages */}
        <div className="chat-container mb-4 h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && <div className="message bot-message">Thinking...</div>}
        </div>
        
        {/* Recipe selection */}
        {recipes.length > 0 && !selectedRecipe && (
          <div className="recipe-options mb-4">
            <h3 className="text-lg font-medium mb-2">Suggested Recipes:</h3>
            <div className="grid gap-2">
              {recipes.map(recipe => (
                <div 
                  key={recipe.id} 
                  className="recipe-option p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{recipe.name}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {Math.round(recipe.match_percentage * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recipe details */}
        {selectedRecipe && (
          <div className="recipe-details mb-4">
            <button 
              onClick={() => setSelectedRecipe(null)} 
              className="text-blue-600 mb-2 inline-flex items-center"
            >
              ← Back to suggestions
            </button>
            
            <h3 className="text-xl font-bold mb-2">{selectedRecipe.name}</h3>
            <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2">You have:</h4>
                <ul className="space-y-1">
                  {selectedRecipe.matching_ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">You need:</h4>
                {selectedRecipe.missing_ingredients.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedRecipe.missing_ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">You have all ingredients!</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2">
                {selectedRecipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
        
        {/* Input form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., avocado, bread, eggs"
            className="input-field flex-grow"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default RecipeChat;