import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">🧠 PaperMind</h1>
        <p className="text-xl mb-6">
          AI-powered academic paper research assistant
        </p>
        <div className="bg-white bg-opacity-20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
          <ul className="text-left space-y-1">
            <li>📚 Smart paper discovery</li>
            <li>🤖 AI-powered abstract generation</li>
            <li>🔍 Advanced search & filtering</li>
            <li>📊 Research trend analysis</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;