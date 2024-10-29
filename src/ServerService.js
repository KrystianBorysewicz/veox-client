// src/ServerService.js
import * as THREE from 'three';

class ServerService {
  constructor() {
    this.gameObjects = {
      ships: {},
      chests: {},
      // Add more object types as needed
    };

    this.callbacks = [];
    this.initializeGameObjects();
    this.startServerSimulation();
  }

  initializeGameObjects() {
    // Initialize enemy ships
    for (let i = 0; i < 5; i++) {
      const shipId = `enemy-${i}`;
      this.gameObjects.ships[shipId] = {
        id: shipId,
        isEnemy: true,
        username: `-=[ Venom ${i} ]=-`,
        moveSpeed: 1,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 500,
          0,
          (Math.random() - 0.5) * 500
        ),
        targetPosition: new THREE.Vector3(),
        group: null,
        // Other properties as needed
      };
      this.setRandomTargetPosition(shipId);
    }

    // Initialize player's ship
    this.gameObjects.ships['player'] = {
      id: 'player',
      isEnemy: false,
      username: 'Omni',
      clanTag: '[DEV]',
      moveSpeed: 1,
      position: new THREE.Vector3(0, 0, 0),
      targetPosition: new THREE.Vector3(0, 0, 0),
      group: null,
    };
  }

  startServerSimulation() {
    // Simulate server updates
    this.interval = setInterval(() => {
      // Update enemy ships' positions based on their target positions
      Object.values(this.gameObjects.ships).forEach((ship) => {
        if (ship.isEnemy) {
          this.updateShipPosition(ship);
        }
      });

      // Notify listeners of updated positions
      this.callbacks.forEach((callback) => callback(this.gameObjects));
    }, 100);
  }

  updateShipPosition(ship) {
    const moveSpeed = ship.moveSpeed || 1;
    const direction = new THREE.Vector3().subVectors(ship.targetPosition, ship.position);

    if (direction.length() > moveSpeed) {
      direction.normalize().multiplyScalar(moveSpeed);
      ship.position.add(direction);
    } else {
      // Ship has reached its target position, set a new target
      this.setRandomTargetPosition(ship.id);
    }
  }

  setRandomTargetPosition(shipId) {
    const ship = this.gameObjects.ships[shipId];
    if (ship) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 350 + Math.random() * 150;

      ship.targetPosition.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
    }
  }

  // Method to send player's target position to the server
  updatePlayerTargetPosition(targetPosition) {
    const playerShip = this.gameObjects.ships['player'];
    if (playerShip) {
      playerShip.targetPosition.copy(targetPosition);
    }
  }

  // Method to register callbacks for updates
  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  // Method to stop the server simulation
  stopServerSimulation() {
    clearInterval(this.interval);
  }
}

const serverService = new ServerService();
export default serverService;
