import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
// Update this path to match your directory structure
import App from './front-end/components/App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();