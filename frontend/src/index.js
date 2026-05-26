import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './Admin';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if admin mode
const isAdmin = window.location.pathname === '/admin';

root.render(isAdmin ? <Admin /> : <App />);
