// src/UILayer.js
import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import Minimap from './DraggableUIElements/Minimap';
import UserInfo from './DraggableUIElements/UserInfo';

function UILayer() {
  const initialWindows = [
    { id: 1, title: 'UserInfo', minimized: false, position: { x: 300, y: 100 } },
    { id: 2, title: 'Minimap', minimized: false, position: { x: 500, y: 100 } },
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
    <div>
      {windows.map(win => !win.minimized && (
        <DraggableWindow
          key={win.id}
          id={win.id}
          title={win.title}
          position={win.position}
          minimizeWindow={minimizeWindow}
          updateWindowPosition={updateWindowPosition}
        >
          {win.title === 'Minimap' && <Minimap />}
          {win.title === 'UserInfo' && <UserInfo />}
        </DraggableWindow>
      ))}
      <div className="minimized-windows">
        {minimizedWindows.map((id) => {
          const win = initialWindows.find(w => w.id === id);
          return (
            <div
              key={id}
              className="minimized-icon ui"
              onClick={(e) => {
                e.stopPropagation();
                restoreWindow(id);
              }}
            >
              {win.title[0]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UILayer;
