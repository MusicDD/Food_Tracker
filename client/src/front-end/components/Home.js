import React from 'react';

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Welcome to Food Planner</h1>
        <p className="text-lg mb-4">Track your ingredients, plan your meals, and reduce food waste.</p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p>Get started by creating an account or logging in to manage your ingredients.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Track Ingredients</h2>
            <p>Keep an inventory of all ingredients you have at home.</p>
          </div>
          <div className="card bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Plan Meals</h2>
            <p>Coming soon: Get recipe suggestions based on your available ingredients.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;