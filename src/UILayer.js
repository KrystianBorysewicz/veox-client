// src/UILayer.js
import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import Minimap from './DraggableUIElements/Minimap';
import User from './DraggableUIElements/User';
import Ship from './DraggableUIElements/Ship';

function UILayer() {
  const initialWindows = [
    { id: 1, title: 'Ship', icon: 'ship', width: '250px', height: '110px', minimized: false, position: { x: 300, y: 20 } },
    { id: 2, title: 'User', icon: 'user', width: '390px', height: '110px', minimized: false, position: { x: 600, y: 20 } },
    { id: 3, title: 'Minimap', icon: 'minimap', width: '390px', height: '110px', minimized: false, position: { x: 900, y: 600 } },
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
          winWidth={win.width}
          winHeight={win.height}
          id={win.id}
          icon={win.icon}
          title={win.title}
          position={win.position}
          minimizeWindow={minimizeWindow}
          updateWindowPosition={updateWindowPosition}
        >
          {win.title === 'Minimap' && <Minimap />}
          {win.title === 'Ship' && <Ship />}
          {win.title === 'User' && <User />}
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
              <img a='' src={process.env.PUBLIC_URL + '/images/icons/' + win.icon + '.png'}></img>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UILayer;
