// src/UILayer.js
import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow'; // Import DraggableWindow component

function UILayer() {
  const initialWindows = [
    { id: 1, title: 'Health', minimized: false, position: { x: 100, y: 100 } },
    { id: 2, title: 'Balance', minimized: false, position: { x: 300, y: 100 } },
    { id: 3, title: 'Minimap', minimized: false, position: { x: 500, y: 100 } },
  ];

  const [windows, setWindows] = useState(initialWindows);
  const [minimizedWindows, setMinimizedWindows] = useState([]);

  const minimizeWindow = (id) => {
    setWindows(windows.map(win => win.id === id ? { ...win, minimized: true } : win));
    setMinimizedWindows([...minimizedWindows, id]);
  };

  const restoreWindow = (id) => {
    setWindows(windows.map(win => win.id === id ? { ...win, minimized: false } : win));
    setMinimizedWindows(minimizedWindows.filter(winId => winId !== id));
  };

  const updateWindowPosition = (id, x, y) => {
    setWindows(windows.map(win => win.id === id ? { ...win, position: { x, y } } : win));
  };

  return (
        <DraggableWindow
          key={4}
          id={4}
          title={'Minimap'}
          position={win.position}
          minimizeWindow={minimizeWindow}
          updateWindowPosition={updateWindowPosition}
        >
          {/* Customize window content here */}
          {win.title === 'Health' && <div>Player Health: 100%</div>}
          {win.title === 'Balance' && <div>Balance: $1,000</div>}
          {win.title === 'Minimap' && <div>Minimap Placeholder</div>}
        </DraggableWindow>
  );
}

export default UILayer;
