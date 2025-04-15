import React from 'react';
import { useAuth } from '../../context/AuthContext';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="card">Please log in to view your dashboard</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <p className="text-gray-600 mb-6">Welcome, {user?.username}! This is your personal dashboard.</p>

        <div className="dashboard-grid">
          <div className="dashboard-card bg-blue-50 border border-blue-100">
            <h3 className="text-xl font-semibold mb-3">Ingredient Stats</h3>
            <p className="text-gray-600">Track your ingredient usage and expiration dates.</p>
          </div>
          
          <div className="dashboard-card bg-green-50 border border-green-100">
            <h3 className="text-xl font-semibold mb-3">Meal Suggestions</h3>
            <p className="text-gray-600">Get recipe ideas based on your available ingredients.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;