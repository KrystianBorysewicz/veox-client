// src/App.js
import React from 'react';
import Game from './Game';
import UILayer from './UILayer';
import './App.css'; // Import styles

function App() {
  return (
    <div className="App">
      <Game />
      <UILayer />
    </div>
  );
}

export default App;
