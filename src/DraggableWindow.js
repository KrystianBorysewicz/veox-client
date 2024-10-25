import React, { useState, useRef } from 'react';

function DraggableWindow({ id, title, winWidth, winHeight, icon, position, minimizeWindow, updateWindowPosition, children }) {
  const [pos, setPos] = useState(position);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Calculate the offset between mouse position and window position
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    // Define event handlers within onMouseDown to maintain consistent references
    const onMouseMove = (e) => {
      e.preventDefault();

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPos({ x: newX, y: newY });
      updateWindowPosition(id, newX, newY);
    };

    const onMouseUp = (e) => {
      e.preventDefault();

      // Remove event listeners when mouse is released
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    // Add event listeners to the document
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div>
      <div
        className="ui-container"
        style={{ left: pos.x, top: pos.y, position: 'absolute', width: winWidth, height: winHeight }}
      >
        <div className="ui-container-header" onMouseDown={onMouseDown}>
                <img className="uic-header-icon" src={process.env.PUBLIC_URL + '/images/icons/' + icon + '.png'} alt="" onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(id);
            }}/>
                <div className="uic-header-title">{title}</div>
            </div>
        <div
          className="window-content"
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
          onClick={stopPropagation}
          onTouchStart={stopPropagation}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DraggableWindow;
