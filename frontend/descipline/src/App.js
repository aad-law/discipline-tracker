import { useState } from 'react';
import './App.css';
import Home from './Component/Home/Home';
import Analytics from './Component/Analytics/Analytics';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="app-container">
      <nav className="app-nav">
        <button
          className={`nav-btn ${page === 'home' ? 'active' : ''}`}
          onClick={() => setPage('home')}
        >
          📋 Dashboard
        </button>
        <button
          className={`nav-btn ${page === 'analytics' ? 'active' : ''}`}
          onClick={() => setPage('analytics')}
        >
          📊 Analytics
        </button>
      </nav>
      
      <div className="page-content">
        {page === 'home' && <Home />}
        {page === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}

export default App;
