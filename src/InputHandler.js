// src/InputHandler.js
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameState } from './GameStateContext';

function InputHandler({ camera }) {
  const {
    ships,
    updateShipTargetPosition,
    setSelectedShipId,
    selectedShipId,
    setIsAttacking,
    setCurrentAmmoType,
  } = useGameState();
  const isAltPressed = useRef(false);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const spherical = useRef(new THREE.Spherical(100, Math.PI / 4, 0)); // radius, phi, theta

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Alt') {
        isAltPressed.current = true;
      }
      if (event.key >= '1' && event.key <= '6') {
        // Change current ammo type based on the pressed number key
        setCurrentAmmoType(parseInt(event.key) - 1);
        console.log(`Switched to ammo type ${parseInt(event.key)}`);
      }
      if (event.key === 'Control' && selectedShipId) {
        setIsAttacking((prev) => !prev);
      }
    }

    function onKeyUp(event) {
      if (event.key === 'Alt') {
        isAltPressed.current = false;
        isDragging.current = false;
      }
    }

    function onMouseDown(event) {
      if (event.button === 0) {
        if (isAltPressed.current) {
          isDragging.current = true;
          previousMousePosition.current = { x: event.clientX, y: event.clientY };
          return;
        }
        const clickedShipId = checkShipSelection(event);
        if (clickedShipId) {
          setSelectedShipId(clickedShipId);
        } else {
          const targetPosition = calculateTargetPosition(event);
          updateShipTargetPosition('player', targetPosition);
        }
      }
    }

    function onMouseMove(event) {
      if (isDragging.current) {
        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;
        spherical.current.theta -= deltaX * 0.01;
        spherical.current.phi -= deltaY * 0.01;
        spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi));
        previousMousePosition.current = { x: event.clientX, y: event.clientY };
        // Update camera position based on spherical coordinates
        updateCameraPosition();
      }
    }

    function onMouseUp(event) {
      if (event.button === 0) {
        isDragging.current = false;
      }
    }

    function onWheel(event) {
      const zoomSpeed = 5;
      spherical.current.radius += event.deltaY * 0.01 * zoomSpeed;
      spherical.current.radius = Math.max(20, Math.min(300, spherical.current.radius));
      updateCameraPosition();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('wheel', onWheel);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, [ships, selectedShipId, updateShipTargetPosition, setSelectedShipId, setIsAttacking, setCurrentAmmoType]);

  function checkShipSelection(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1); // Only consider objects in layer 1 (ships)
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      Object.values(ships)
        .filter((ship) => ship.mesh)
        .map((ship) => ship.mesh),
      true
    );

    if (intersects.length > 0) {
      const clickedShipMesh = intersects[0].object;
      const clickedShip = Object.values(ships).find((ship) => ship.mesh === clickedShipMesh);
      return clickedShip ? clickedShip.id : null;
    }
    return null;
  }

  function calculateTargetPosition(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    return intersectPoint;
  }

  function updateCameraPosition() {
    const playerShip = ships['player'];
    if (playerShip && playerShip.position) {
      const offsetX =
        spherical.current.radius * Math.sin(spherical.current.phi) * Math.sin(spherical.current.theta);
      const offsetY = spherical.current.radius * Math.cos(spherical.current.phi);
      const offsetZ =
        spherical.current.radius * Math.sin(spherical.current.phi) * Math.cos(spherical.current.theta);

      camera.position.set(
        playerShip.position.x + offsetX,
        playerShip.position.y + offsetY,
        playerShip.position.z + offsetZ
      );
      camera.lookAt(playerShip.position);
    }
  }

  return null;
}

export default InputHandler;
