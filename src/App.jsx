import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useCloak from './hooks/useCloak';

function Content() {
  const cloak = useCloak();
  return (
    <div style={{ background: 'black', color: 'white', padding: '20px', minHeight: '100vh' }}>
      <h1>CloakSeed</h1>
      <p>Status: {cloak.cipher ? 'cipher loaded' : 'no cipher'}</p>
      <button 
        onClick={() => cloak.setCipherFromTheme('animals')}
        style={{ background: 'blue', color: 'white', padding: '10px 20px', marginTop: '10px' }}
      >
        Load Animals Theme
      </button>
      <p style={{ marginTop: '20px' }}>Real Seed: {cloak.realSeed || 'none'}</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/*" element={<Content />} />
      </Routes>
    </Router>
  );
}
